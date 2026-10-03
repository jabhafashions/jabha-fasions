import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import ProductCard from './ProductCard';
import { useProducts } from '../../context/ProductsContext';
import './Products.css';

export default function ProductsPage() {
  const { products, categories, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  // Always open the page from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setCategory = (cat) => {
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="products-section products-page">
        <div className="container">
          <Link to="/" className="products-back">&larr; Back to Home</Link>
          <p className="eyebrow">Our Collections</p>
          <h1 className="section-heading">Our Products</h1>
          <p className="section-sub">
            Browse everything we carry, organized by category. Reach out to us
            to check availability or place an order.
          </p>

          <div className="products-filters" role="tablist" aria-label="Filter by category">
            <button
              className={activeCategory === 'All' ? 'is-active' : ''}
              onClick={() => setCategory('All')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? 'is-active' : ''}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="products-empty">Loading products&hellip;</p>
          ) : filtered.length === 0 ? (
            <p className="products-empty">No products in this category yet.</p>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}