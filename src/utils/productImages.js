// Eagerly import every image under src/assets/products/**, keyed by its path.
const modules = import.meta.glob('../assets/products/**/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
});

// Matches your current setup: assets/products/<category>/<n>.jpeg
// e.g. productImage('sarees', 1) -> assets/products/sarees/001.jpeg
export function productImage(category, index) {
  const suffix = `/${String(index).padStart(3, '0')}.jpeg`;
  const key = Object.keys(modules).find(
    (path) => path.includes(`/products/${category}/`) && path.endsWith(suffix)
  );
  return key ? modules[key] : '';
}

// For when you're ready to give a product multiple color variants with their
// own photos: put images in assets/products/<category>/<product-slug>/<color-slug>/
// (1.jpeg, 2.jpeg, 3.jpeg) and call this instead.
export function productImageSet(category, productSlug, colorSlug) {
  const prefix = `/products/${category}/${productSlug}/${colorSlug}/`;

  return Object.keys(modules)
    .filter((path) => path.includes(prefix))
    .sort()
    .map((path) => modules[path]);
}
