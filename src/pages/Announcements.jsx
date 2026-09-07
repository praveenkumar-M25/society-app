import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { postAnnouncement, subscribeAnnouncements } from '../services/announcements'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Announcements() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [form, setForm] = useState({ title: '', body: '' })
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const unsub = subscribeAnnouncements(
      (data) => {
        setItems(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setPosting(true)
    try {
      await postAnnouncement({ ...form, authorName: profile?.name || 'Admin' })
      setForm({ title: '', body: '' })
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="page">
      <h1>Digital Notice Board</h1>

      {profile?.role === 'admin' && (
        <form className="inline-form" onSubmit={handlePost}>
          <input
            placeholder="Announcement title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            placeholder="Write the announcement…"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <button disabled={posting}>{posting ? 'Posting…' : 'Post announcement'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading announcements…" />}
      {status === 'error' && <ErrorState message="Couldn't load announcements. Check your connection." />}
      {status === 'ready' && items.length === 0 && (
        <EmptyState title="No announcements yet" hint="Committee updates will appear here." />
      )}

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.id} className="card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <span className="card-meta">— {item.authorName}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
