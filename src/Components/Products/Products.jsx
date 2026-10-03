import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import ProductCard from './ProductCard';
import './Products.css';

export default function Products() {
  const { products, categories, loading } = useProducts();
  const featured = products.slice(0, 3);

  return (
    <section id="products" className="products-section">
      <div className="container">
        <p className="eyebrow">Our Collections</p>
        <h2 className="section-heading">Products</h2>
        <p className="section-sub">
          A glimpse of what we currently carry. Explore the full collection by
          category.
        </p>

        <div className="products-filters">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {loading ? (
          <p className="products-empty">Loading products&hellip;</p>
        ) : (
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        )}

        <div className="products-cta">
          <Link to="/products" className="btn btn-solid">
            Explore Our Products
          </Link>
        </div>
      </div>
    </section>
  );
}