import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useCart } from '../../context/CartContext';
import { FREE_SHIPPING_ABOVE, formatINR } from '../../utils/shipping';
import './Cart.css';

export default function CartPage() {
  const { lines, subtotal, shipping, total, updateQty, removeItem, stockIssue, isAtLimit } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="shop-page">
        <div className="container">
          <p className="eyebrow">Shopping</p>
          <h1 className="section-heading">Your Cart</h1>

          {lines.length === 0 ? (
            <div className="shop-empty">
              <p>Your cart is empty.</p>
              <Link to="/products" className="btn btn-solid">Explore Our Products</Link>
            </div>
          ) : (
            <div className="shop-grid">
              <div className="cart-lines">
                {lines.map((line) => (
                  <article className="cart-line" key={line.key}>
                    <div className="cart-line-img">
                      {line.image ? <img src={line.image} alt={line.name} /> : <span>No image</span>}
                    </div>
                    <div className="cart-line-info">
                      <h3>{line.name}</h3>
                      {line.color && <p className="cart-line-meta">Colour: {line.color}</p>}
                      <p className="cart-line-meta">{formatINR(line.price)} each</p>
                      {!line.inStock && <p className="cart-stock-warn">Out of stock - please remove this item.</p>}
                      {line.inStock && line.exceeds && (
                        <p className="cart-stock-warn">Only {line.stock} available - please reduce the quantity.</p>
                      )}

                      <div className="cart-line-actions">
                        <div className="jf-stepper">
                          <button
                            type="button"
                            className="jf-stepper-btn"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(line.key, line.qty - 1)}
                          >
                            &minus;
                          </button>
                          <span className="jf-stepper-qty">{line.qty}</span>
                          <button
                            type="button"
                            className="jf-stepper-btn"
                            aria-label="Increase quantity"
                            disabled={isAtLimit(line.productId)}
                            onClick={() => updateQty(line.key, line.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(line.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong className="cart-line-total">{formatINR(line.lineTotal)}</strong>
                  </article>
                ))}
              </div>

              <aside className="summary-card">
                <h2>Order Summary</h2>
                <div className="summary-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="summary-hint">
                    Add {formatINR(FREE_SHIPPING_ABOVE - subtotal)} more for free shipping.
                  </p>
                )}
                <div className="summary-row summary-total">
                  <span>Total</span><span>{formatINR(total)}</span>
                </div>
                {stockIssue ? (
                  <button type="button" className="btn btn-solid summary-btn" disabled>
                    Fix stock issues to continue
                  </button>
                ) : (
                  <Link to="/checkout" className="btn btn-solid summary-btn">Proceed to Checkout</Link>
                )}
                <Link to="/products" className="summary-link">Continue shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
