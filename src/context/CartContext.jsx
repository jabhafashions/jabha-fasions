import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductsContext';
import { calcShipping } from '../utils/shipping';

const CartContext = createContext(null);
const STORAGE_KEY = 'jabha-cart-v1';
export const MAX_QTY = 10;

const cartKey = (productId, variantId) => `${productId}::${variantId || 'default'}`;
const sameProduct = (a, b) => String(a) === String(b);

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

  // most of this product a customer may hold (stock, capped at MAX_QTY).
  // While products are still loading we don't know, so allow up to MAX_QTY.
  const limitFor = useCallback(
    (productId) => {
      const p = products.find((x) => sameProduct(x.id, productId));
      if (!p) return MAX_QTY;
      return Math.max(0, Math.min(MAX_QTY, Number(p.stock) || 0));
    },
    [products]
  );

  const addToCart = useCallback(
    (productId, variantId, qty = 1) => {
      const key = cartKey(productId, variantId);
      const limit = limitFor(productId);
      setItems((prev) => {
        // colours of one product share the same stock
        const others = prev
          .filter((i) => sameProduct(i.productId, productId) && i.key !== key)
          .reduce((s, i) => s + i.qty, 0);
        const existing = prev.find((i) => i.key === key);
        const nextQty = Math.min(limit - others, (existing?.qty ?? 0) + qty);
        if (nextQty <= 0) return prev;
        if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: nextQty } : i));
        return [...prev, { key, productId, variantId: variantId || 'default', qty: nextQty }];
      });
    },
    [limitFor]
  );

  const updateQty = useCallback(
    (key, qty) => {
      setItems((prev) => {
        if (qty <= 0) return prev.filter((i) => i.key !== key);
        const target = prev.find((i) => i.key === key);
        if (!target) return prev;
        const others = prev
          .filter((i) => sameProduct(i.productId, target.productId) && i.key !== key)
          .reduce((s, i) => s + i.qty, 0);
        const nextQty = Math.min(qty, limitFor(target.productId) - others);
        if (nextQty <= 0) return prev.filter((i) => i.key !== key);
        return prev.map((i) => (i.key === key ? { ...i, qty: nextQty } : i));
      });
    },
    [limitFor]
  );

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQty = useCallback(
    (productId, variantId) =>
      items.find((i) => i.key === cartKey(productId, variantId))?.qty ?? 0,
    [items]
  );

  // true when the customer already holds all that can be bought of this product
  const isAtLimit = useCallback(
    (productId) =>
      items
        .filter((i) => sameProduct(i.productId, productId))
        .reduce((s, i) => s + i.qty, 0) >= limitFor(productId),
    [items, limitFor]
  );

  // Join cart entries with the live product list so prices/names/stock are always
  // current. Entries whose product was deleted are skipped.
  const lines = useMemo(() => {
    const perProduct = {};
    items.forEach((i) => {
      perProduct[i.productId] = (perProduct[i.productId] || 0) + i.qty;
    });

    return items
      .map((item) => {
        const product = products.find((p) => sameProduct(p.id, item.productId));
        if (!product) return null;
        const variant =
          product.variants?.find((v) => v.id === item.variantId) || product.variants?.[0];
        const price = Number(product.price);
        const stock = Number(product.stock) || 0;
        return {
          ...item,
          name: product.name,
          color: variant?.color || '',
          image: variant?.images?.[0] || '',
          price,
          lineTotal: price * item.qty,
          stock,
          inStock: stock >= 1,
          exceeds: perProduct[item.productId] > stock,
        };
      })
      .filter(Boolean);
  }, [items, products]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = calcShipping(subtotal);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const stockIssue = lines.some((l) => !l.inStock || l.exceeds);

  return (
    <CartContext.Provider
      value={{
        lines,
        count,
        subtotal,
        shipping,
        total: subtotal + shipping,
        stockIssue,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        getQty,
        isAtLimit,
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
