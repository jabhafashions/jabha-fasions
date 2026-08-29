import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container about-inner">
        <div>
          <p className="eyebrow">Our Story</p>
          <h2 className="section-heading">About Us</h2>
          <p className="about-text">
            Jabha Fashions brings together ready-made and custom-tailored
            traditional wear — sarees, madisars, kurtis, amman vastras, and
            menswear — for everyday moments and special occasions alike. Each
            piece is chosen or made with care, so what you wear feels as good
            as it looks.
          </p>
          <p className="about-text">
            Visit us to see the full range in person, or get in touch to
            discuss a custom order.
          </p>
        </div>
        <div className="about-stats">
          <div>
            <strong>5</strong>
            <span>Product Lines</span>
          </div>
          <div>
            <strong>5</strong>
            <span>Custom Services</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Made To Please</span>
          </div>
        </div>
      </div>
    </section>
  );
}
