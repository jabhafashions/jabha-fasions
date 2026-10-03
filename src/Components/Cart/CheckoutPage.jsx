import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { formatINR } from '../../utils/shipping';
import './Cart.css';

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'Tamil Nadu',
  pincode: '',
  notes: '',
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10))) {
    e.phone = 'Enter a valid 10-digit mobile number.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (!f.address.trim()) e.address = 'Please enter your delivery address.';
  if (!f.city.trim()) e.city = 'Please enter your city.';
  if (!f.state.trim()) e.state = 'Please enter your state.';
  if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode.';
  return e;
}

// supabase.functions.invoke hides the server's message inside error.context
async function readError(error, fallback) {
  try {
    const body = await error.context.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export default function CheckoutPage() {
  const { lines, subtotal, shipping, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePay = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setMessage('');

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load the payment window. Check your internet and try again.');

      // 1) server creates the order (and works out the real total itself)
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          customer: form,
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            qty: l.qty,
          })),
        },
      });
      if (error) throw new Error(await readError(error, "Couldn't start your order. Please try again."));

      // 2) open Razorpay
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Jabha Fashions',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#7a1f22' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response) => {
          // 3) server checks the payment signature before marking it paid
          const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
            body: response,
          });
          if (verifyError) {
            setMessage(
              `We received your payment but could not confirm it on screen. Please do NOT pay again. Your order number is ${data.orderNumber} - contact us and we will confirm it.`
            );
            setBusy(false);
            return;
          }
          navigate(`/order-success/${data.orderNumber}`, { replace: true });
          clearCart();
        },
      });
      rzp.on('payment.failed', (r) => {
        setMessage(r?.error?.description || 'Payment failed. Please try again.');
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setMessage(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  const field = (id, label, props = {}) => (
    <div className={`co-field ${props.wide ? 'co-wide' : ''}`}>
      <label htmlFor={`co-${id}`}>{label}</label>
      {props.textarea ? (
        <textarea id={`co-${id}`} rows={3} value={form[id]} onChange={set(id)} />
      ) : (
        <input
          id={`co-${id}`}
          type={props.type || 'text'}
          inputMode={props.inputMode}
          autoComplete={props.autoComplete}
          maxLength={props.maxLength}
          value={form[id]}
          onChange={set(id)}
        />
      )}
      {errors[id] && <span className="co-error">{errors[id]}</span>}
    </div>
  );

  if (lines.length === 0) {
    return (
      <>
        <Navbar />
        <main className="shop-page">
          <div className="container shop-empty">
            <p>Your cart is empty.</p>
            <Link to="/products" className="btn btn-solid">Explore Our Products</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="shop-page">
        <div className="container">
          <Link to="/cart" className="products-back">&larr; Back to Cart</Link>
          <p className="eyebrow">Almost there</p>
          <h1 className="section-heading">Checkout</h1>

          <form className="shop-grid" onSubmit={handlePay} noValidate>
            <div className="co-form">
              <h2>Delivery Details</h2>
              <div className="co-fields">
                {field('name', 'Full name', { autoComplete: 'name' })}
                {field('phone', 'Mobile number', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel', maxLength: 14 })}
                {field('email', 'Email', { type: 'email', autoComplete: 'email', wide: true })}
                {field('address', 'Address (house no., street, area)', { textarea: true, wide: true })}
                {field('city', 'City', { autoComplete: 'address-level2' })}
                {field('state', 'State', { autoComplete: 'address-level1' })}
                {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
                {field('notes', 'Order notes (optional - measurements, customisation, etc.)', { textarea: true, wide: true })}
              </div>
            </div>

            <aside className="summary-card">
              <h2>Your Order</h2>
              <ul className="summary-items">
                {lines.map((l) => (
                  <li key={l.key}>
                    <span>
                      {l.name}
                      {l.color ? ` (${l.color})` : ''} &times; {l.qty}
                    </span>
                    <span>{formatINR(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span><span>{formatINR(total)}</span>
              </div>

              {message && <p className="co-banner">{message}</p>}

              <button type="submit" className="btn btn-solid summary-btn" disabled={busy}>
                {busy ? 'Please wait\u2026' : `Pay ${formatINR(total)}`}
              </button>
              <p className="summary-hint">
                Secure payment by Razorpay - UPI, cards, net banking and wallets.
              </p>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
