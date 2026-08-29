import './Hero.css';
import dancerImage from '../../assets/dancer.png';

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Beauty lies within&hellip;</p>
          <p className="hero-text">
            Fashion isn't just about what you wear, it's about how you feel
            wearing it. At <strong>Jabha Fashions</strong>, every piece is
            chosen to bring out the <strong>confidence</strong>,{' '}
            <strong>elegance</strong>, and <strong>individuality</strong>{' '}
            that's already within you. From everyday wear to those special
            occasions worth dressing up for, we believe true style starts
            from the inside and shows on the outside.
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn btn-solid">
              View Products
            </a>
            <a href="#services" className="btn">
              Our Services
            </a>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <img src={dancerImage} alt="Jabha Fashions Dancer" className="hero-art-image" />
        </div>
      </div>
    </section>
  );
}
