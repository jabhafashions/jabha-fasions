import { useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import './CategoriesPanel.css';

export default function CategoriesPanel() {
  const { categories, products, addCategory, deleteCategory } = useProducts();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const countFor = (category) => products.filter((product) => product.category === category).length;

  const handleAdd = async (event) => {
    event.preventDefault();
    setBusy(true);
    const ok = await addCategory(name);
    if (ok) setName('');
    setBusy(false);
  };

  const handleDelete = (category) => {
    if (window.confirm(`Remove the "${category}" category?`)) deleteCategory(category);
  };

  return (
    <section className="category-panel">
      <h2>Categories</h2>

      <ul className="category-chips">
        {categories.map((category) => {
          const count = countFor(category);
          return (
            <li key={category}>
              <span>{category}</span>
              <small>{count}</small>
              <button
                type="button"
                aria-label={`Remove ${category}`}
                title={count > 0 ? 'Move or delete its products first' : 'Remove category'}
                disabled={count > 0}
                onClick={() => handleDelete(category)}
              >
                &times;
              </button>
            </li>
          );
        })}
      </ul>

      <form className="category-form" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category, e.g. Lehengas"
          maxLength={40}
        />
        <button className="btn btn-solid" disabled={busy || !name.trim()}>
          Add Category
        </button>
      </form>
    </section>
  );
}
