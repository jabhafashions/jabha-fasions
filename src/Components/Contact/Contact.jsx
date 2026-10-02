import './Contact.css';
import shopImage from '../../assets/shop.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const CONTACT = {
  phones: [
    { display: '97890 21183', tel: '+919789021183' },
    { display: '86081 68862', tel: '+918608168862' },
  ],
  addressLines: [
    'No.18/1, Kamarajar Salai,',
    'Lakshmi Puram, Thiruvanmiyur,',
    'Chennai - 600 041.',
  ],
  mapQuery:'Jabha Fashions, No.18/1, Kamarajar Salai, Lakshmi Puram, Thiruvanmiyur, Chennai 600041',
  instagram: 'https://www.instagram.com/jabhafashions?stkn=Mml3cTg0ejdocDBr',
  youtube: 'https://youtube.com/@jabhafashions2015?si=WeznYUaTK9ujus33',
};

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="container contact-inner">
        <div>
          <p className="eyebrow">Visit Us</p>
          <h2 className="section-heading">Contact &amp; Location</h2>
          <p className="section-sub">
            Drop by the boutique, call us, or message us on WhatsApp to discuss
            your custom order.
          </p>

          <div className="contact-block">
            <h3>Address</h3>
            <address>
              <strong>Jabha Fashions</strong>
              <span className="contact-sub">Clothing Tailoring &amp; Embroidery</span>
              {CONTACT.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>

          <div className="contact-block">
            <h3>Call / WhatsApp</h3>
            <ul className="contact-phones">
              {CONTACT.phones.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`}>{p.display}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="contact-block">
  <h3>Follow Us</h3>
  <ul className="contact-social">
  <li>
    <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
      <FontAwesomeIcon icon={faInstagram} />
    </a>
  </li>
  <li>
    <a href={CONTACT.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
      <FontAwesomeIcon icon={faYoutube} />
    </a>
  </li>
</ul>
</div>

          <div className="contact-actions">
            <a className="btn btn-solid" href={`tel:${CONTACT.phones[0].tel}`}>
              Call Now
            </a>
            <a
              className="btn"
              href={`https://wa.me/${CONTACT.phones[0].tel.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              className="btn"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                CONTACT.mapQuery
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Get Directions
            </a>
          </div>
        </div>

        <div className="contact-photo">
          <img
            src={shopImage}
            alt="Jabha Fashions shop front on Kamarajar Salai, Thiruvanmiyur"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
