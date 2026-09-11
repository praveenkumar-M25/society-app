import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/profile'

export default function Profile() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [flatNumber, setFlatNumber] = useState(profile?.flatNumber || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile(user.uid, { name, flatNumber })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1>My Profile</h1>
      <form className="inline-form" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <label className="field-label">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label className="field-label">Flat number</label>
        <input value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required />

        <label className="field-label">Email</label>
        <input value={profile?.email || ''} disabled />

        <label className="field-label">Role</label>
        <input value={profile?.role || ''} disabled style={{ textTransform: 'capitalize' }} />

        {saved && <p className="form-note">Profile updated!</p>}
        <button disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}