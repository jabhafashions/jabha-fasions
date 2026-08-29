import { useEffect, useState } from 'react';
import './Navbar.css';
import logoImage from '../../assets/logo.jpeg';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
        <a href="#home" className="navbar-brand">
          <img src={logoImage} alt="Jabha Fashions Logo" className="navbar-logo" />
          <span className="navbar-title">Jabha Fashions</span>
        </a>

        <nav className="navbar-links" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

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
              <a href={link.href} onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
