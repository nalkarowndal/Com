import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Normalize: filter out any redundant leading 'Home' to ensure exactly one Home
  const normalizedItems = items.filter(
    (item, idx) => !(idx === 0 && item.label?.trim().toLowerCase() === 'home')
  );

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {normalizedItems.map((item, index) => {
          const isLast = index === normalizedItems.length - 1;
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
