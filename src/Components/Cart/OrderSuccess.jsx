import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Cart.css';

export default function OrderSuccess() {
  const { orderNumber } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="shop-page">
        <div className="container shop-empty">
          <div className="success-tick" aria-hidden="true">&#10003;</div>
          <h1 className="section-heading">Thank you for your order!</h1>
          <p>
            Your payment was successful. Your order number is{' '}
            <strong>{orderNumber}</strong>.
          </p>
          <p>
            We will contact you shortly on your phone number to confirm the
            details. Please keep this order number for reference.
          </p>
          <Link to="/products" className="btn btn-solid">Continue Shopping</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
