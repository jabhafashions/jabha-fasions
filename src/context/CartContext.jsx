import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductsContext';
import { calcShipping } from '../utils/shipping';

const CartContext = createContext(null);
const STORAGE_KEY = 'jabha-cart-v1';
export const MAX_QTY = 10;

const cartKey = (productId, variantId) => `${productId}::${variantId || 'default'}`;

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { products } = useProducts();
  const [items, setItems] = useState(loadCart); // [{ key, productId, variantId, qty }]

  // keep the cart across refreshes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / blocked - cart just won't persist */
    }
  }, [items]);

  const addToCart = useCallback((productId, variantId, qty = 1) => {
    const key = cartKey(productId, variantId);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        { key, productId, variantId: variantId || 'default', qty: Math.min(MAX_QTY, qty) },
      ];
    });
  }, []);

  const updateQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQty = useCallback(
    (productId, variantId) =>
      items.find((i) => i.key === cartKey(productId, variantId))?.qty ?? 0,
    [items]
  );

  // Join cart entries with the live product list so prices/names are always
  // current. Entries whose product was deleted are skipped.
  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((p) => String(p.id) === String(item.productId));
          if (!product) return null;
          const variant =
            product.variants?.find((v) => v.id === item.variantId) || product.variants?.[0];
          const price = Number(product.price);
          return {
            ...item,
            name: product.name,
            color: variant?.color || '',
            image: variant?.images?.[0] || '',
            price,
            lineTotal: price * item.qty,
          };
        })
        .filter(Boolean),
    [items, products]
  );

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = calcShipping(subtotal);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        count,
        subtotal,
        shipping,
        total: subtotal + shipping,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        getQty,
        cartKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
