import { createContext, useContext, useEffect, useState } from 'react';
import { initialProducts, CATEGORIES } from '../data/initialProducts';

const STORAGE_KEY = 'jabha_products_v3';
const LEGACY_KEYS = ['jabha_products_v1', 'jabha_products_v2'];

const ProductsContext = createContext(null);

function loadProducts() {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Could not read saved products, using defaults.', err);
  }

  localStorage.removeItem(STORAGE_KEY);
  return initialProducts;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(loadProducts);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error('Could not save products.', err);
    }
  }, [products]);

  const addProduct = (product) => {
    const id = 'p' + Date.now();
    setProducts((prev) => [...prev, { ...product, id }]);
  };

  const updateProduct = (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefaults = () => setProducts(initialProducts);

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories: CATEGORIES,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used inside a ProductsProvider');
  }
  return ctx;
}
