import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createEvent, rsvpEvent, subscribeEvents } from '../services/events'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Events() {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsub = subscribeEvents(
      (data) => {
        setEvents(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    setCreating(true)
    try {
      await createEvent({ ...form, createdBy: profile?.name })
      setForm({ title: '', date: '', time: '', location: '', description: '' })
    } finally {
      setCreating(false)
    }
  }

  const isAdmin = profile?.role === 'admin'
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="page">
      <h1>Events & Meetings</h1>

      {isAdmin && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Event title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button disabled={creating}>{creating ? 'Creating…' : 'Create event'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading events…" />}
      {status === 'error' && <ErrorState message="Couldn't load events." />}
      {status === 'ready' && events.length === 0 && (
        <EmptyState title="No events scheduled" hint="Upcoming meetings and events will appear here." />
      )}

      <ul className="card-list">
        {events.map((ev) => {
          const hasRsvpd = ev.rsvps?.includes(profile?.flatNumber)
          const isPast = ev.date < today
          return (
            <li key={ev.id} className="card">
              <div className="card-head">
                <h3>{ev.title}</h3>
                {isPast && <span className="badge">Past</span>}
              </div>
              <p>{ev.description}</p>
              <span className="card-meta">
                📅 {ev.date} {ev.time && `· ⏰ ${ev.time}`} {ev.location && `· 📍 ${ev.location}`}
              </span>
              <span className="card-meta">{ev.rsvps?.length || 0} attending</span>
              {!isAdmin && !isPast && (
                <div className="status-actions">
                  <button
                    className={hasRsvpd ? 'active' : ''}
                    disabled={hasRsvpd}
                    onClick={() => rsvpEvent(ev.id, profile?.flatNumber)}
                  >
                    {hasRsvpd ? "✓ You're attending" : "RSVP - I'll attend"}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}