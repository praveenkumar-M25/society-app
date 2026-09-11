import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Announcements from './pages/Announcements'
import Complaints from './pages/Complaints'
import Bookings from './pages/Bookings'
import Directory from './pages/Directory'
import Polls from './pages/Polls'
import Profile from './pages/Profile'
import EmergencyContacts from './pages/EmergencyContacts'
import Events from './pages/Events'
import Payments from './pages/Payments'
import Visitors from './pages/Visitors'
import Discussions from './pages/Discussions'
import Marketplace from './pages/Marketplace'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function page(Component) {
  return (
    <ProtectedRoute>
      <Layout>
        <Component />
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={page(Announcements)} />
        <Route path="/complaints" element={page(Complaints)} />
        <Route path="/bookings" element={page(Bookings)} />
        <Route path="/polls" element={page(Polls)} />
        <Route path="/directory" element={page(Directory)} />
        <Route path="/profile" element={page(Profile)} />
        <Route path="/emergency" element={page(EmergencyContacts)} />
        <Route path="/events" element={page(Events)} />
        <Route path="/payments" element={page(Payments)} />
        <Route path="/visitors" element={page(Visitors)} />
        <Route path="/discussions" element={page(Discussions)} />
        <Route path="/marketplace" element={page(Marketplace)} />
      </Routes>
    </AuthProvider>
  )
}