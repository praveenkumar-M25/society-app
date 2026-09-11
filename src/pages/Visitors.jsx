import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { VISITOR_STATUS, logVisitor, subscribeVisitors, updateVisitorStatus } from '../services/visitors'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Visitors() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ visitorName: '', purpose: '', expectedDate: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = subscribeVisitors(
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
    if (!form.visitorName.trim() || !form.expectedDate) return
    setSubmitting(true)
    try {
      await logVisitor({ ...form, flatNumber: profile?.flatNumber, requestedBy: profile?.name })
      setForm({ visitorName: '', purpose: '', expectedDate: '' })
    } finally {
      setSubmitting(false)
    }
  }

  const canManage = profile?.role === 'admin' || profile?.role === 'security'
  const visibleItems = canManage ? items : items.filter((i) => i.flatNumber === profile?.flatNumber)

  return (
    <div className="page">
      <h1>Visitor Management</h1>

      {!canManage && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Visitor name" value={form.visitorName} onChange={(e) => setForm((f) => ({ ...f, visitorName: e.target.value }))} />
          <input placeholder="Purpose of visit" value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
          <input type="date" value={form.expectedDate} onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value }))} />
          <button disabled={submitting}>{submitting ? 'Logging…' : 'Expect a visitor'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading visitor log…" />}
      {status === 'error' && <ErrorState message="Couldn't load visitors." />}
      {status === 'ready' && visibleItems.length === 0 && (
        <EmptyState title="No visitor entries" hint={canManage ? 'Residents will log expected visitors here.' : 'Log an expected visitor above.'} />
      )}

      <ul className="card-list">
        {visibleItems.map((v) => (
          <li key={v.id} className="card">
            <div className="card-head">
              <h3>{v.visitorName}</h3>
              <span className={`badge ${v.status === VISITOR_STATUS.CHECKED_OUT ? 'badge-resolved' : v.status === VISITOR_STATUS.CHECKED_IN ? 'badge-in-progress' : 'badge-open'}`}>
                {v.status}
              </span>
            </div>
            <p>{v.purpose}</p>
            <span className="card-meta">Flat {v.flatNumber} · {v.expectedDate} · Requested by {v.requestedBy}</span>
            {canManage && (
              <div className="status-actions">
                {Object.values(VISITOR_STATUS).map((s) => (
                  <button key={s} className={s === v.status ? 'active' : ''} onClick={() => updateVisitorStatus(v.id, s)}>
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