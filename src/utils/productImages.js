// Eagerly import every image under src/assets/products/**, keyed by its path.
const modules = import.meta.glob('../assets/products/**/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
});

// Returns the Nth image (1-indexed, matching 001.jpeg / 002.jpeg naming) in a category folder.
export function productImage(category, index) {
  const folderName = String(category || '').trim();
  const fileNumber = String(index).padStart(3, '0');

  const key = Object.keys(modules).find((path) => {
    const lowerPath = path.toLowerCase();
    const categoryMatches = lowerPath.includes(`/products/${folderName.toLowerCase()}/`);
    const fileMatches =
      lowerPath.endsWith(`/${fileNumber}.jpeg`) ||
      lowerPath.endsWith(`/${fileNumber}.jpg`) ||
      lowerPath.endsWith(`/${fileNumber}.png`);

    return categoryMatches && fileMatches;
  });

  return key ? modules[key] : '';
}