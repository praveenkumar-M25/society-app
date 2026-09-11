// Lightweight in-app notifications: shows a badge with the count of
// announcements posted since the user last opened the notice board.
// No backend/push infra needed — just compares against a locally
// remembered "last seen" timestamp.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeAnnouncements } from '../services/announcements'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsub = subscribeAnnouncements((items) => {
      const lastSeen = localStorage.getItem('notices_last_seen')
      if (!lastSeen) {
        setUnreadCount(items.length ? 0 : 0) // first visit: nothing "unread" yet
        return
      }
      const lastSeenTime = new Date(lastSeen).getTime()
      const unread = items.filter((i) => {
        const t = i.createdAt?.toDate ? i.createdAt.toDate().getTime() : 0
        return t > lastSeenTime
      })
      setUnreadCount(unread.length)
    }, () => {})
    return unsub
  }, [])

  function handleClick() {
    localStorage.setItem('notices_last_seen', new Date().toISOString())
    setUnreadCount(0)
    navigate('/dashboard')
  }

  return (
    <button className="bell-btn" onClick={handleClick} title="Notifications">
      🔔
      {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
    </button>
  )
}