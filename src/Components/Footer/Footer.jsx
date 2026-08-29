import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <span className="footer-title">Jabha Fashions</span>
          <p>Beauty lies within&hellip;</p>
        </div>
        <ul className="footer-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About Us</a></li>
        </ul>
        <p className="footer-copy">&copy; {year} Jabha Fashions. All rights reserved.</p>
      </div>
    </footer>
  );
}
