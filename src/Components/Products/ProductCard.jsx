import { useRef, useState } from 'react';
import AddToCartControl from '../Cart/AddToCartControl';

const SWIPE_THRESHOLD = 40; // px of horizontal drag needed to count as a swipe

export default function ProductCard({ product }) {
  const variants = product.variants?.length
    ? product.variants
    : [{ id: 'default', color: '', hex: '', images: [] }];

  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const touchStartX = useRef(null);

  const activeVariant = variants[variantIndex];
  const images = activeVariant.images?.length ? activeVariant.images : [''];
  const activeImage = images[imageIndex] || images[0];

  const handleVariantChange = (index) => {
    setVariantIndex(index);
    setImageIndex(0); // reset to the first photo when the color changes
  };

  const goToImage = (index) => {
    if (index < 0 || index >= images.length) return;
    setImageIndex(index);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) goToImage(imageIndex - 1); // swiped right -> previous
    if (delta < -SWIPE_THRESHOLD) goToImage(imageIndex + 1); // swiped left -> next
    touchStartX.current = null;
  };

  return (
    <article className="product-card">
      <div
        className="product-image"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={`${product.name}${activeVariant.color ? ` — ${activeVariant.color}` : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">No image yet</div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-nav-arrow product-nav-arrow-prev"
              onClick={() => goToImage(imageIndex - 1)}
              disabled={imageIndex === 0}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
            <button
              type="button"
              className="product-nav-arrow product-nav-arrow-next"
              onClick={() => goToImage(imageIndex + 1)}
              disabled={imageIndex === images.length - 1}
              aria-label="Next photo"
            >
              &#8250;
            </button>

            <div className="product-dots" role="tablist" aria-label={`${product.name} photos`}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`product-dot ${i === imageIndex ? 'is-active' : ''}`}
                  onClick={() => goToImage(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === imageIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        {variants.length > 1 && (
          <div className="product-color-row">
            <span className="product-color-label">
              Colour: <strong>{activeVariant.color || `Option ${variantIndex + 1}`}</strong>
            </span>
            <div
              className="product-color-options"
              role="tablist"
              aria-label={`${product.name} colors`}
            >
              {variants.map((variant, i) => (
                <button
                  key={variant.id}
                  type="button"
                  className={`product-color-option ${i === variantIndex ? 'is-active' : ''}`}
                  onClick={() => handleVariantChange(i)}
                  aria-pressed={i === variantIndex}
                >
                  {variant.images?.[0] ? (
                    <img src={variant.images[0]} alt={variant.color || `Option ${i + 1}`} />
                  ) : (
                    <span
                      className="product-color-option-fallback"
                      style={{ backgroundColor: variant.hex || '#ccc' }}
                    />
                  )}
                  <span className="product-color-name">
                    {variant.color || `Option ${i + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="product-buy-row">
          <span className="product-price">
            &#8377;{Number(product.price).toLocaleString('en-IN')}
          </span>
          <AddToCartControl product={product} variantId={activeVariant.id} />
        </div>
      </div>
    </article>
  );
}
