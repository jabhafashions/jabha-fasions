import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CATEGORIES } from '../data/initialProducts';
import { productImage } from '../utils/productImages';

const ProductsContext = createContext(null);

function addLocalImageFallbacks(productRows) {
  const categoryIndexes = {};

  return productRows.map((product) => {
    const categoryIndex = categoryIndexes[product.category] || 0;
    categoryIndexes[product.category] = categoryIndex + 1;
    const fallbackImage = productImage(product.category, categoryIndex + 1);
    const variants = Array.isArray(product.variants) ? product.variants : [];

    if (!fallbackImage || variants.some((variant) => variant.images?.length)) {
      return product;
    }

    return {
      ...product,
      variants: variants.map((variant, index) =>
        index === 0 ? { ...variant, images: [fallbackImage] } : variant
      ),
    };
  });
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Could not load products.', fetchError);
      setError('Could not load products from the database.');
    } else {
      setProducts(addLocalImageFallbacks(data));
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Live sync: when anyone (any device, any tab) changes the catalogue,
    // every open copy of the site picks it up automatically.
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (product) => {
    const { error: insertError } = await supabase.from('products').insert({
      category: product.category,
      name: product.name,
      price: product.price,
      description: product.description,
      variants: product.variants,
    });
    if (insertError) {
      console.error('Could not add product.', insertError);
      setError("Couldn't save that product — please try again.");
      return false;
    }
    await fetchProducts();
    return true;
  };

  const updateProduct = async (id, updates) => {
    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
    if (updateError) {
      console.error('Could not update product.', updateError);
      setError("Couldn't save that change — please try again.");
      return false;
    }
    await fetchProducts();
    return true;
  };

  const deleteProduct = async (id) => {
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
    if (deleteError) {
      console.error('Could not delete product.', deleteError);
      setError("Couldn't delete that product — please try again.");
      return false;
    }
    await fetchProducts();
    return true;
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories: CATEGORIES,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
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
