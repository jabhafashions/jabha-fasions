import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';

const EMPTY_VARIANT = { color: '', hex: '#7a1f22', images: ['', '', ''] };

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  description: '',
  variants: [{ ...EMPTY_VARIANT }],
};

function makeVariantId() {
  return 'v' + Math.random().toString(36).slice(2, 9);
}

export default function ProductForm({ initialValue, onDone, onCancel }) {
  const { categories, addProduct, updateProduct } = useProducts();
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(initialValue);

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name,
        category: initialValue.category,
        price: initialValue.price,
        description: initialValue.description,
        variants: (initialValue.variants?.length
          ? initialValue.variants
          : [{ ...EMPTY_VARIANT }]
        ).map((v) => ({
          ...v,
          images: [v.images?.[0] || '', v.images?.[1] || '', v.images?.[2] || ''],
        })),
      });
    } else {
      setForm({ ...EMPTY_FORM, category: categories[0] || '' });
    }
  }, [initialValue, categories]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateVariant = (index, updates) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...updates } : v)),
    }));
  };

  const updateVariantImage = (variantIndex, imageIndex, value) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        const images = [...v.images];
        images[imageIndex] = value;
        return { ...v, images };
      }),
    }));
  };

  const handleImageFile = (variantIndex, imageIndex) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Shrink to a sensible max size before storing, so a full-resolution
        // phone photo doesn't blow past the browser's storage limit.
        const maxDim = 1000;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateVariantImage(variantIndex, imageIndex, canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price) || 0,
      description: form.description,
      variants: form.variants.map((v) => ({
        id: v.id || makeVariantId(),
        color: v.color,
        hex: v.hex,
        images: v.images.filter(Boolean), // drop empty image slots
      })),
    };
    if (isEditing) {
      updateProduct(initialValue.id, payload);
    } else {
      addProduct(payload);
    }
    onDone();
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>

      <div className="form-row">
        <label htmlFor="pf-name">Name</label>
        <input
          id="pf-name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="pf-category">Category</label>
        <select
          id="pf-category"
          value={form.category}
          onChange={handleChange('category')}
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="pf-price">Price (&#8377;)</label>
        <input
          id="pf-price"
          type="number"
          min="0"
          step="1"
          value={form.price}
          onChange={handleChange('price')}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="pf-description">Description</label>
        <textarea
          id="pf-description"
          rows={3}
          value={form.description}
          onChange={handleChange('description')}
          required
        />
      </div>

      <div className="form-variants">
        <div className="form-variants-header">
          <span>Color Variants</span>
          <button type="button" className="btn" onClick={addVariant}>
            + Add Color
          </button>
        </div>

        {form.variants.map((variant, vIndex) => (
          <div className="variant-block" key={vIndex}>
            <div className="variant-block-header">
              <strong>Color {vIndex + 1}</strong>
              {form.variants.length > 1 && (
                <button
                  type="button"
                  className="btn admin-danger"
                  onClick={() => removeVariant(vIndex)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="variant-row">
              <div className="form-row">
                <label>Color name</label>
                <input
                  type="text"
                  placeholder="e.g. Maroon"
                  value={variant.color}
                  onChange={(e) => updateVariant(vIndex, { color: e.target.value })}
                  required
                />
              </div>
              <div className="form-row form-row-swatch">
                <label>Swatch color</label>
                <input
                  type="color"
                  value={variant.hex}
                  onChange={(e) => updateVariant(vIndex, { hex: e.target.value })}
                />
              </div>
            </div>

            <div className="variant-images">
              {[0, 1, 2].map((imgIndex) => (
                <div className="variant-image-slot" key={imgIndex}>
                  <label>Photo {imgIndex + 1}</label>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={variant.images[imgIndex]}
                    onChange={(e) => updateVariantImage(vIndex, imgIndex, e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile(vIndex, imgIndex)}
                  />
                  {variant.images[imgIndex] && (
                    <img
                      className="variant-image-preview"
                      src={variant.images[imgIndex]}
                      alt=""
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-solid">
          {isEditing ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
