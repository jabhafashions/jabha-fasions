import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';
import logoImage from '../../assets/logo.jpeg';

const NAV_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Products', href: '/products', route: true },
  { label: 'Services', href: '/#services' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { count } = useCart();

  // Close the mobile menu whenever the viewport grows back to desktop size.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <a href="/#home" className="navbar-brand">
          <img src={logoImage} alt="Jabha Fashions Logo" className="navbar-logo" />
          <span className="navbar-title">Jabha Fashions</span>
        </a>

        <nav className="navbar-links" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.route ? (
                <Link to={link.href}>{link.label}</Link>
              ) : (
                <a href={link.href}>{link.label}</a>
              )}
            </li>
          ))}
          </ul>
        </nav>

        <Link to="/cart" className="navbar-cart" aria-label={`Cart, ${count} items`}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 7h12l-1 13H7L6 7z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {count > 0 && <span className="navbar-cart-badge">{count}</span>}
        </Link>

        <button
          className={`navbar-toggle ${isOpen ? 'is-open' : ''}`}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="mobile-menu"
        className={`navbar-mobile ${isOpen ? 'is-open' : ''}`}
        aria-label="Mobile"
      >
        <ul>
          {NAV_LINKS.map((link) => (
          <li key={link.label}>
            {link.route ? (
              <Link to={link.href}>{link.label}</Link>
            ) : (
              <a href={link.href}>{link.label}</a>
            )}
          </li>
        ))}
        </ul>
      </nav>
    </header>
  );
}
