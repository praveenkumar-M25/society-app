import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addContact, removeContact, subscribeContacts } from '../services/emergencyContacts'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function EmergencyContacts() {
  const { profile } = useAuth()
  const [contacts, setContacts] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ name: '', role: '', phone: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const unsub = subscribeContacts(
      (data) => {
        setContacts(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setAdding(true)
    try {
      await addContact(form)
      setForm({ name: '', role: '', phone: '' })
    } finally {
      setAdding(false)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="page">
      <h1>Emergency Contacts</h1>

      {isAdmin && (
        <form className="inline-form" onSubmit={handleAdd}>
          <input placeholder="Name (e.g. Fire Station)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="Role / category (e.g. Fire, Police, Security)" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <button disabled={adding}>{adding ? 'Adding…' : 'Add contact'}</button>
        </form>
      )}

      {status === 'loading' && <Loader label="Loading contacts…" />}
      {status === 'error' && <ErrorState message="Couldn't load emergency contacts." />}
      {status === 'ready' && contacts.length === 0 && (
        <EmptyState title="No emergency contacts yet" hint="The committee will add key contact numbers here." />
      )}

      <ul className="card-list">
        {contacts.map((c) => (
          <li key={c.id} className="card">
            <div className="card-head">
              <h3>{c.name}</h3>
              <a href={`tel:${c.phone}`} className="call-btn">📞 {c.phone}</a>
            </div>
            <span className="card-meta">{c.role}</span>
            {isAdmin && (
              <div className="status-actions">
                <button className="delete-btn" onClick={() => removeContact(c.id)}>Remove</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}