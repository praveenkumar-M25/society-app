import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PAY_STATUS, createPaymentRecord, markAsPaid, subscribePayments } from '../services/payments'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Payments() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ flatNumber: '', month: '', amount: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsub = subscribePayments(
      (data) => {
        setItems(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.flatNumber.trim() || !form.month || !form.amount) return
    setCreating(true)
    try {
      await createPaymentRecord({ ...form, amount: Number(form.amount) })
      setForm({ flatNumber: '', month: '', amount: '' })
    } finally {
      setCreating(false)
    }
  }

  const isAdmin = profile?.role === 'admin'
  const visibleItems = isAdmin ? items : items.filter((i) => i.flatNumber === profile?.flatNumber)

  return (
    <div className="page">
      <h1>Maintenance Payments</h1>

      {isAdmin && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Flat number (e.g. A-101)" value={form.flatNumber} onChange={(e) => setForm((f) => ({ ...f, flatNumber: e.target.value }))} />
          <input type="month" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <button disabled={creating}>{creating ? 'Adding…' : 'Add payment record'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading payments…" />}
      {status === 'error' && <ErrorState message="Couldn't load payment records." />}
      {status === 'ready' && visibleItems.length === 0 && (
        <EmptyState title="No payment records" hint={isAdmin ? 'Add a maintenance due above.' : 'Nothing due yet.'} />
      )}

      <ul className="card-list">
        {visibleItems.map((p) => (
          <li key={p.id} className="card">
            <div className="card-head">
              <h3>Flat {p.flatNumber} · ₹{p.amount}</h3>
              <span className={`badge ${p.status === PAY_STATUS.PAID ? 'badge-resolved' : 'badge-open'}`}>
                {p.status}
              </span>
            </div>
            <span className="card-meta">Month: {p.month}</span>
            {isAdmin && p.status === PAY_STATUS.PENDING && (
              <div className="status-actions">
                <button onClick={() => markAsPaid(p.id)}>Mark as Paid</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}