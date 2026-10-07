import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  const [categoryList, setCategoryList] = useState(CATEGORIES); // fallback until the table loads
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

  const fetchCategories = async () => {
    const { data, error: catError } = await supabase
      .from('categories')
      .select('name')
      .order('id', { ascending: true });
    if (catError) {
      console.error('Could not load categories.', catError);
      return;
    }
    setCategoryList(data.map((category) => category.name));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Include any category still used by a product, even if its row is missing.
  const categories = useMemo(
    () => [...new Set([...categoryList, ...products.map((product) => product.category)])],
    [categoryList, products]
  );

  const addCategory = async (rawName) => {
    const name = rawName.trim().replace(/\s+/g, ' ');
    if (!name) return false;
    if (categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
      setError('That category already exists.');
      return false;
    }
    const { error: insertError } = await supabase.from('categories').insert({ name });
    if (insertError) {
      console.error('Could not add category.', insertError);
      setError("Couldn't add that category — please try again.");
      return false;
    }
    await fetchCategories();
    setError(null);
    return true;
  };

  const deleteCategory = async (name) => {
    if (products.some((product) => product.category === name)) {
      setError(`"${name}" still has products. Move or delete them first.`);
      return false;
    }
    const { error: deleteError } = await supabase.from('categories').delete().eq('name', name);
    if (deleteError) {
      console.error('Could not delete category.', deleteError);
      setError("Couldn't delete that category — please try again.");
      return false;
    }
    await fetchCategories();
    setError(null);
    return true;
  };

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
        categories,
        addCategory,
        deleteCategory,
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
