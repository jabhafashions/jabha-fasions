import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

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
          <li><a href="/#home">Home</a></li>
          <li><a href="/#products">Products</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#about">About Us</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
        <div className="footer-contact">
          <p>No.18/1, Kamarajar Salai, Lakshmi Puram, Thiruvanmiyur, Chennai - 600 041.</p>
          <p>
            <a href="tel:+919789021183">97890 21183</a> &nbsp;|&nbsp;{' '}
            <a href="tel:+918608168862">86081 68862</a>
          </p>
          <div className="footer-social">
  <a href="https://www.instagram.com/jabhafashions?stkn=Mml3cTg0ejdocDBr" target="_blank" rel="noreferrer" aria-label="Instagram">
    <FontAwesomeIcon icon={faInstagram} />
  </a>
  <a href="https://youtube.com/@jabhafashions2015?si=WeznYUaTK9ujus33" target="_blank" rel="noreferrer" aria-label="YouTube">
    <FontAwesomeIcon icon={faYoutube} />
  </a>
</div>
        </div>
        <p className="footer-copy">&copy; {year} Jabha Fashions. All rights reserved.</p>
      </div>
    </footer>
  );
}
