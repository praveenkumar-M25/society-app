import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', flatNumber: '', email: '', password: '', role: 'resident' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError('Registration failed. The email may already be in use.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Join your residential community</p>

        <label>
          Full name
          <input value={form.name} onChange={update('name')} required />
        </label>

        <label>
          Flat number
          <input value={form.flatNumber} onChange={update('flatNumber')} placeholder="e.g. B-204" required />
        </label>

        <label>
          Email
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>

        <label>
          Password
          <input type="password" value={form.password} onChange={update('password')} minLength={6} required />
        </label>

        <label>
          Role
          <select value={form.role} onChange={update('role')}>
            <option value="resident">Resident</option>
            <option value="admin">Admin / Committee member</option>
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
