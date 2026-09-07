import { useEffect, useState } from 'react'
import { fetchMembers } from '../services/directory'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Directory() {
  const [members, setMembers] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMembers()
      .then((data) => {
        setMembers(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filtered = members.filter((m) =>
    `${m.name} ${m.flatNumber}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <h1>Member Directory</h1>

      <input
        className="search-input"
        placeholder="Search by name or flat number…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {status === 'loading' && <Loader label="Loading members…" />}
      {status === 'error' && <ErrorState message="Couldn't load the directory." />}
      {status === 'ready' && filtered.length === 0 && (
        <EmptyState title="No members found" hint="Try a different search term." />
      )}

      <ul className="card-list">
        {filtered.map((m) => (
          <li key={m.id} className="card">
            <h3>{m.name}</h3>
            <span className="card-meta">Flat {m.flatNumber} · {m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
