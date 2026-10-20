import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchCategories } from '../../services/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCats() {
      try {
        const data = await fetchCategories();
        if (isMounted) setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="admin-categories-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Discipline Categories</h1>
          <p className="admin-view-desc">
            Core editorial branches preserving the architectural and cultural taxonomy of PRISM.
          </p>
        </div>
      </div>

      <div className="admin-notice-banner">
        <strong>Preservation Policy:</strong> The four core disciplines (Architecture, Travel, Art, Food) form the architectural foundation of the brand and are locked against accidental deletion.
      </div>

      {loading ? (
        <div className="admin-page-loading">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="categories-card-grid">
          {categories.map((cat, idx) => (
            <div key={cat.id || cat.slug} className="category-admin-card">
              <div className="cat-card-header">
                <span className="cat-order">0{idx + 1}</span>
                <span className="cat-status active">Active</span>
              </div>
              <h2 className="cat-card-name">{cat.name}</h2>
              <span className="cat-slug-pill">/{cat.slug}</span>
              <p className="cat-card-desc">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
