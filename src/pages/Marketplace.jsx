import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LISTING_TYPES, createListing, deleteListing, subscribeListings } from '../services/marketplace'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Marketplace() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ type: LISTING_TYPES[0], title: '', price: '', description: '', contact: '' })
  const [posting, setPosting] = useState(false)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const unsub = subscribeListings(
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
    if (!form.title.trim()) return
    setPosting(true)
    try {
      await createListing({ ...form, postedBy: profile?.name, flatNumber: profile?.flatNumber })
      setForm({ type: LISTING_TYPES[0], title: '', price: '', description: '', contact: '' })
    } finally {
      setPosting(false)
    }
  }

  const visibleItems = filter === 'All' ? items : items.filter((i) => i.type === filter)

  return (
    <div className="page">
      <h1>Buy / Sell / Rent</h1>

      <form className="inline-form" onSubmit={handlePost}>
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          {LISTING_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input placeholder="Item title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <input placeholder="Price (optional)" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input placeholder="Contact number" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
        <button disabled={posting}>{posting ? 'Posting…' : 'Post listing'}</button>
      </form>

      <div className="filter-row">
        {['All', ...LISTING_TYPES].map((t) => (
          <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {status === 'loading' && <Loader label="Loading listings…" />}
      {status === 'error' && <ErrorState message="Couldn't load listings." />}
      {status === 'ready' && visibleItems.length === 0 && (
        <EmptyState title="No listings yet" hint="Post something to buy, sell, or rent above." />
      )}

      <ul className="card-list">
        {visibleItems.map((item) => (
          <li key={item.id} className="card">
            <div className="card-head">
              <h3>{item.title}</h3>
              <span className="badge">{item.type}{item.price ? ` · ₹${item.price}` : ''}</span>
            </div>
            <p>{item.description}</p>
            <span className="card-meta">
              {item.postedBy} (Flat {item.flatNumber}) · 📞 {item.contact}
            </span>
            {item.flatNumber === profile?.flatNumber && (
              <div className="status-actions">
                <button className="delete-btn" onClick={() => deleteListing(item.id)}>Remove listing</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}