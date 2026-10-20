import Breadcrumb from './Breadcrumb';

export default function PageHeader({
  badge,
  title,
  description,
  breadcrumbs = []
}) {
  return (
    <header className="page-header-section">
      <Breadcrumb items={breadcrumbs} />
      <div className="page-header-content">
        {badge && <span className="page-badge">{badge}</span>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
    </header>
  );
}
