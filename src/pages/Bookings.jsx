import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FACILITIES, createBooking, isSlotTaken, subscribeBookings } from '../services/bookings'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

const SLOTS = ['7:00 AM - 8:00 AM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM']

export default function Bookings() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ facility: FACILITIES[0], date: '', slot: SLOTS[0] })
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const unsub = subscribeBookings(
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
    setNotice('')
    if (!form.date) {
      setNotice('Please choose a date.')
      return
    }
    if (isSlotTaken(items, form.facility, form.date, form.slot)) {
      setNotice('That slot is already booked. Please pick another.')
      return
    }
    setSubmitting(true)
    try {
      await createBooking({
        ...form,
        bookedBy: profile?.name,
        flatNumber: profile?.flatNumber,
      })
      setNotice('Booking confirmed!')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>Facility Booking</h1>

      <form className="inline-form" onSubmit={handleSubmit}>
        <select value={form.facility} onChange={(e) => setForm((f) => ({ ...f, facility: e.target.value }))}>
          {FACILITIES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <select value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}>
          {SLOTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button disabled={submitting}>{submitting ? 'Booking…' : 'Book slot'}</button>
        {notice && <p className="form-note">{notice}</p>}
      </form>

      {status === 'loading' && <Loader label="Loading bookings…" />}
      {status === 'error' && <ErrorState message="Couldn't load bookings." />}
      {status === 'ready' && items.length === 0 && (
        <EmptyState title="No bookings yet" hint="Book a facility slot above." />
      )}

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.id} className="card">
            <h3>{item.facility}</h3>
            <p>{item.date} · {item.slot}</p>
            <span className="card-meta">Booked by {item.bookedBy} (Flat {item.flatNumber})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
