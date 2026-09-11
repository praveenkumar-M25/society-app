import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addReply, startDiscussion, subscribeDiscussions } from '../services/discussions'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Discussions() {
  const { profile } = useAuth()
  const [threads, setThreads] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ title: '', message: '' })
  const [posting, setPosting] = useState(false)
  const [replyDrafts, setReplyDrafts] = useState({})

  useEffect(() => {
    const unsub = subscribeDiscussions(
      (data) => {
        setThreads(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handleStart(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setPosting(true)
    try {
      await startDiscussion({ ...form, authorName: profile?.name })
      setForm({ title: '', message: '' })
    } finally {
      setPosting(false)
    }
  }

  async function handleReply(threadId) {
    const message = replyDrafts[threadId]?.trim()
    if (!message) return
    await addReply(threadId, { authorName: profile?.name, message })
    setReplyDrafts((d) => ({ ...d, [threadId]: '' }))
  }

  return (
    <div className="page">
      <h1>Community Discussions</h1>

      <form className="inline-form" onSubmit={handleStart}>
        <input placeholder="Topic title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <textarea placeholder="What's on your mind?" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        <button disabled={posting}>{posting ? 'Posting…' : 'Start discussion'}</button>
      </form>

      {status === 'loading' && <Loader label="Loading discussions…" />}
      {status === 'error' && <ErrorState message="Couldn't load discussions." />}
      {status === 'ready' && threads.length === 0 && (
        <EmptyState title="No discussions yet" hint="Start the first conversation above." />
      )}

      <ul className="card-list">
        {threads.map((t) => (
          <li key={t.id} className="card">
            <h3>{t.title}</h3>
            <p>{t.message}</p>
            <span className="card-meta">— {t.authorName}</span>

            {t.replies?.length > 0 && (
              <div className="reply-list">
                {t.replies.map((r, i) => (
                  <div key={i} className="reply-item">
                    <strong>{r.authorName}:</strong> {r.message}
                  </div>
                ))}
              </div>
            )}

            <div className="reply-form">
              <input
                placeholder="Write a reply…"
                value={replyDrafts[t.id] || ''}
                onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
              />
              <button onClick={() => handleReply(t.id)}>Reply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}