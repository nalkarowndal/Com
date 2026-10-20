import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumbs">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb-item">
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              {isLast || !item.href ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
