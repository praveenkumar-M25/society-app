// A big icon-badge + title + subtitle used at the top of every page,
// so each section has a distinct visual identity instead of plain text.
export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div className="page-header">
      <div className="page-header-icon">{icon}</div>
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-header-sub">{subtitle}</p>}
      </div>
    </div>
  )
}