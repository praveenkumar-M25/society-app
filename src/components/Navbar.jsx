import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="brand">Greenview Society</div>
      <nav>
        <NavLink to="/dashboard">Notice Board</NavLink>
        <NavLink to="/complaints">Complaints</NavLink>
        <NavLink to="/bookings">Bookings</NavLink>
        <NavLink to="/directory">Directory</NavLink>
      </nav>
      <div className="nav-user">
        <span>{profile?.name} · {profile?.flatNumber}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </header>
  )
}
