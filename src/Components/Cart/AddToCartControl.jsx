import { useCart, MAX_QTY } from '../../context/CartContext';
import './AddToCartControl.css';

// "Add to Cart" pill that turns into a  [ - 2 + ]  stepper once the item is in
// the cart. At quantity 1 the minus becomes a bin so tapping it removes the line.
export default function AddToCartControl({ product, variantId }) {
  const { getQty, updateQty, addToCart, cartKey } = useCart();
  const qty = getQty(product.id, variantId);
  const key = cartKey(product.id, variantId);

  if (qty === 0) {
    return (
      <button
        type="button"
        className="jf-add-btn"
        onClick={() => addToCart(product.id, variantId, 1)}
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="jf-stepper">
      <button
        type="button"
        className="jf-stepper-btn"
        aria-label={qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
        onClick={() => updateQty(key, qty - 1)}
      >
        {qty === 1 ? '\u{1F5D1}' : '\u2212'}
      </button>
      <span className="jf-stepper-qty">{qty}</span>
      <button
        type="button"
        className="jf-stepper-btn"
        aria-label="Increase quantity"
        disabled={qty >= MAX_QTY}
        onClick={() => updateQty(key, qty + 1)}
      >
        +
      </button>
    </div>
  );
}
