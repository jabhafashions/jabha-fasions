import { useMemo, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import './Products.css';

export default function Products() {
  const { products, categories } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <section id="products" className="products-section">
      <div className="container">
        <p className="eyebrow">Our Collections</p>
        <h2 className="section-heading">Products</h2>
        <p className="section-sub">
          Browse what we currently carry, organized by category. Reach out to
          us to check availability or place an order.
        </p>

        <div className="products-filters" role="tablist" aria-label="Filter by category">
          <button
            className={activeCategory === 'All' ? 'is-active' : ''}
            onClick={() => setActiveCategory('All')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'is-active' : ''}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="products-empty">
            No products in this category yet. Add one from the admin page.
          </p>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="product-body">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <span className="product-price">
                    &#8377;{Number(product.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
