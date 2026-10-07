import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import sareesImg from '../../assets/products/sarees/001.jpeg';
import madisarsImg from '../../assets/products/Madisars/001.jpeg';
import kurtisImg from '../../assets/products/Kurtis/001.jpeg';
import './Products.css';

// Fixed showcase cards: edit the text/images here, no database involved.
const SHOWCASE = [
  {
    category: 'Sarees',
    text: 'Timeless sarees for weddings, festivals and everyday elegance.',
    image: sareesImg,
  },
  {
    category: 'Madisars',
    text: 'Traditional madisars, ready to wear or to be customised into a modern dress.',
    image: madisarsImg,
  },
  {
    category: 'Kurtis',
    text: 'Comfortable, stylish kurtis for every occasion.',
    image: kurtisImg,
  },
];

export default function Products() {
  const { categories } = useProducts();

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
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}>
              {cat}
            </Link>
          ))}
        </div>

        <div className="showcase-grid">
          {SHOWCASE.map((item) => (
            <Link
              key={item.category}
              to={`/products?category=${encodeURIComponent(item.category)}`}
              className="showcase-card"
            >
              <div className="showcase-img">
                <img src={item.image} alt={item.category} loading="lazy" />
              </div>
              <div className="showcase-body">
                <h3>{item.category}</h3>
                <p>{item.text}</p>
                <span className="showcase-link">View Collection &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="products-cta">
          <Link to="/products" className="btn btn-solid">
            Explore Our Products
          </Link>
        </div>
      </div>
    </section>
  );
}