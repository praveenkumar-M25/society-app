import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  STATUS,
  raiseComplaint,
  subscribeComplaints,
  updateComplaintStatus,
} from '../services/complaints'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

const CATEGORIES = ['Plumbing', 'Electrical', 'Housekeeping', 'Security', 'Other']

export default function Complaints() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0] })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = subscribeComplaints(
      (data) => {
        setItems(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await raiseComplaint({
        ...form,
        raisedBy: profile?.name,
        flatNumber: profile?.flatNumber,
      })
      setForm({ title: '', description: '', category: CATEGORIES[0] })
    } finally {
      setSubmitting(false)
    }
  }

  const isAdmin = profile?.role === 'admin'
  const visibleItems = isAdmin ? items : items.filter((i) => i.flatNumber === profile?.flatNumber)

  return (
    <div className="page">
      <h1>Complaints & Service Requests</h1>

      {!isAdmin && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            placeholder="Issue title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <textarea
            placeholder="Describe the issue…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <button disabled={submitting}>{submitting ? 'Submitting…' : 'Raise complaint'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading complaints…" />}
      {status === 'error' && <ErrorState message="Couldn't load complaints." />}
      {status === 'ready' && visibleItems.length === 0 && (
        <EmptyState title="No complaints" hint={isAdmin ? 'Nothing raised by residents yet.' : 'Raise one above if something needs attention.'} />
      )}

      <ul className="card-list">
        {visibleItems.map((item) => (
          <li key={item.id} className="card">
            <div className="card-head">
              <h3>{item.title}</h3>
              <span className={`badge badge-${item.status?.replace(' ', '-').toLowerCase()}`}>
                {item.status}
              </span>
            </div>
            <p>{item.description}</p>
            <span className="card-meta">
              {item.category} · Flat {item.flatNumber} · {item.raisedBy}
            </span>

            {isAdmin && (
              <div className="status-actions">
                {Object.values(STATUS).map((s) => (
                  <button
                    key={s}
                    className={s === item.status ? 'active' : ''}
                    onClick={() => updateComplaintStatus(item.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
