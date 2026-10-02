import './About.css';
import ownersImage from '../../assets/owners.jpg';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container about-inner">
        <div className="about-photo">
          <img
            src={ownersImage}
            alt="The two women partners behind Jabha Fashions"
            loading="lazy"
          />
        </div>
        <div>
          <p className="eyebrow">Our Story</p>
          <h2 className="section-heading">About Us</h2>
          <p className="about-text">
            We are two women partners united by a passion for fashion,
            tradition, and creativity. Our boutique brings a fresh,
            contemporary touch to timeless Indian wear through unique
            customisation. We specialise in transforming traditional Madisar
            and Panjakacham sarees into beautifully crafted modern dresses,
            creating outfits that honour heritage while embracing today&rsquo;s
            style.
          </p>
          <p className="about-text">
            From weddings and celebrations to special occasions, every piece is
            thoughtfully customised to suit your personality, comfort, and
            vision. What makes us special is our ability to turn cherished
            traditional sarees into wearable, stylish creations without losing
            their cultural essence.
          </p>
          <p className="about-tagline">Your saree, your story, our creativity.</p>
        </div>
      </div>
    </section>
  );
}
