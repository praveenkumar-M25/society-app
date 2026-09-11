// Small inline SVG icons — no extra npm package needed, keeps bundle light.
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const NoticeIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>
)

export const ComplaintIcon = (p) => (
  <svg {...base} {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
)

export const BookingIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
)

export const DirectoryIcon = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><path d="M17 11c1.9 0 3.5 1.6 3.5 3.5M20 20c0-2.2-1.3-4-3-4.7" /></svg>
)

export const LeafIcon = (p) => (
  <svg {...base} {...p}><path d="M11 20A7 7 0 0 1 4 13c0-6 7-11 15-11 0 8-5 15-11 15Z" /><path d="M4 20c4-4 8-6 15-15" /></svg>
)

export const PollIcon = (p) => (
  <svg {...base} {...p}><path d="M6 20V10M12 20V4M18 20v-6" /></svg>
)

export const EventIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /><circle cx="12" cy="16" r="2" /></svg>
)
export const PaymentIcon = (p) => (
  <svg {...base} {...p}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
)
export const VisitorIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>
)
export const EmergencyIcon = (p) => (
  <svg {...base} {...p}><path d="M12 2v6M12 22v-6M2 12h6M22 12h-6" /><circle cx="12" cy="12" r="3" /></svg>
)
export const DiscussionIcon = (p) => (
  <svg {...base} {...p}><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1l-4.5 1 1-4.5a8.4 8.4 0 0 1-1-4A8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" /></svg>
)
export const MarketIcon = (p) => (
  <svg {...base} {...p}><path d="M3 9l1-5h16l1 5" /><rect x="3" y="9" width="18" height="12" rx="1" /><path d="M9 13a3 3 0 0 0 6 0" /></svg>
)
export const ProfileIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>
)