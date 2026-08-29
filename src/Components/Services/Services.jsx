import { services } from '../../data/servicesData';
import './Services.css';

export default function Services() {
  return (
    <section id="services" className="services-section">
      <div className="container">
        <p className="eyebrow">What We Offer</p>
        <h2 className="section-heading">Services</h2>
        <p className="section-sub">
          Beyond ready-made pieces, we tailor and customize to fit you and
          your occasion exactly.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <span className="service-mark" aria-hidden="true" />
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
