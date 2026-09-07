// Shared loading / empty / error views so every screen handles these
// states consistently instead of reinventing them.
export function Loader({ label = 'Loading…' }) {
  return (
    <div className="state-view">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="state-view empty">
      <p className="state-title">{title}</p>
      {hint && <p className="state-hint">{hint}</p>}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="state-view error">
      <p className="state-title">{message}</p>
    </div>
  )
}
