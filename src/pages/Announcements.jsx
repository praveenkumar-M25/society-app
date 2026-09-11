import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { postAnnouncement, subscribeAnnouncements } from '../services/announcements'
import { subscribeComplaints, STATUS } from '../services/complaints'
import { subscribeBookings } from '../services/bookings'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'
import { NoticeIcon, ComplaintIcon, BookingIcon } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import { HeroNotice } from '../components/Icons'

export default function Announcements() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ title: '', body: '' })
  const [posting, setPosting] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const unsub = subscribeAnnouncements(
      (data) => {
        setItems(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    const unsubComplaints = subscribeComplaints(setComplaints, () => {})
    const unsubBookings = subscribeBookings(setBookings, () => {})
    return () => {
      unsub()
      unsubComplaints()
      unsubBookings()
    }
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

  const openComplaints = complaints.filter((c) => c.status !== STATUS.RESOLVED).length
  const today = new Date().toISOString().slice(0, 10)
  const upcomingBookings = bookings.filter((b) => b.date >= today).length
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page">
      <div className="hero-banner">
        <h1 className="hero-title">{greeting}, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="hero-sub">Here's what's happening in Greenview Society today.</p>

        <div className="stats-row">
          <div className="stat-card">
            <NoticeIcon />
            <div>
              <span className="stat-number">{items.length}</span>
              <span className="stat-label">Announcements</span>
            </div>
          </div>
          <div className="stat-card">
            <ComplaintIcon />
            <div>
              <span className="stat-number">{openComplaints}</span>
              <span className="stat-label">Open complaints</span>
            </div>
          </div>
          <div className="stat-card">
            <BookingIcon />
            <div>
              <span className="stat-number">{upcomingBookings}</span>
              <span className="stat-label">Upcoming bookings</span>
            </div>
          </div>
        </div>
      </div>

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