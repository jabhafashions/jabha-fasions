import { useState } from 'react';

export default function ProductCard({ product }) {
  const variants = product.variants?.length
    ? product.variants
    : [{ id: 'default', color: '', hex: '', images: [] }];

  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const activeVariant = variants[variantIndex];
  const images = activeVariant.images?.length ? activeVariant.images : [''];
  const activeImage = images[imageIndex] || images[0];

  const handleVariantChange = (index) => {
    setVariantIndex(index);
    setImageIndex(0); // reset to the first photo when the color changes
  };

  return (
    <article className="product-card">
      <div className="product-image">
        {activeImage ? (
          <img src={activeImage} alt={`${product.name} — ${activeVariant.color}`} loading="lazy" />
        ) : (
          <div className="product-image-placeholder">No image yet</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-thumbs" role="tablist" aria-label={`${product.name} photos`}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`product-thumb ${i === imageIndex ? 'is-active' : ''}`}
              onClick={() => setImageIndex(i)}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>
      )}

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        {variants.length > 1 && (
          <div className="product-swatches" role="tablist" aria-label={`${product.name} colors`}>
            {variants.map((variant, i) => (
              <button
                key={variant.id}
                type="button"
                className={`product-swatch ${i === variantIndex ? 'is-active' : ''}`}
                style={{ backgroundColor: variant.hex || '#ccc' }}
                title={variant.color}
                aria-label={variant.color}
                aria-pressed={i === variantIndex}
                onClick={() => handleVariantChange(i)}
              />
            ))}
          </div>
        )}

        <span className="product-price">
          &#8377;{Number(product.price).toLocaleString('en-IN')}
        </span>
      </div>
    </article>
  );
}
