export default function PageHeader({
  badge,
  title,
  description
}) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        {badge && <span className="page-header-badge">{badge}</span>}
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-desc">{description}</p>}
        <div className="page-header-divider" aria-hidden="true" />
      </div>
    </header>
  );
}
