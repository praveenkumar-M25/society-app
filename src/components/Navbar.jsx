import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import {
  NoticeIcon, ComplaintIcon, BookingIcon, DirectoryIcon, PollIcon, LeafIcon,
  EventIcon, PaymentIcon, VisitorIcon, EmergencyIcon, DiscussionIcon, MarketIcon, ProfileIcon,
} from './Icons'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand"><LeafIcon /> Greenview Society</div>

      <div className="sidebar-user">
        <span className="avatar-chip">{profile?.name?.[0]?.toUpperCase() || '?'}</span>
        <div>
          <div className="sidebar-user-name">{profile?.name}</div>
          <div className="sidebar-user-flat">Flat {profile?.flatNumber} · {profile?.role}</div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard"><NoticeIcon /> Notice Board</NavLink>
        <NavLink to="/events"><EventIcon /> Events</NavLink>
        <NavLink to="/complaints"><ComplaintIcon /> Complaints</NavLink>
        <NavLink to="/payments"><PaymentIcon /> Payments</NavLink>
        <NavLink to="/visitors"><VisitorIcon /> Visitors</NavLink>
        <NavLink to="/emergency"><EmergencyIcon /> Emergency</NavLink>
        <NavLink to="/bookings"><BookingIcon /> Bookings</NavLink>
        <NavLink to="/polls"><PollIcon /> Polls</NavLink>
        <NavLink to="/discussions"><DiscussionIcon /> Discussions</NavLink>
        <NavLink to="/marketplace"><MarketIcon /> Marketplace</NavLink>
        <NavLink to="/directory"><DirectoryIcon /> Directory</NavLink>
        <NavLink to="/profile"><ProfileIcon /> Profile</NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>Log out</button>
    </aside>
  )
}