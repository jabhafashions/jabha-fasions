import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { supabase } from '../../lib/supabaseClient';

const EMPTY_VARIANT = { color: '', hex: '#7a1f22', images: ['', '', '', '', ''] };

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
  const [uploadingSlot, setUploadingSlot] = useState(null); // e.g. "0-1" while that photo uploads
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
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
          images: [
            v.images?.[0] || '',
            v.images?.[1] || '',
            v.images?.[2] || '',
            v.images?.[3] || '',
            v.images?.[4] || '',
          ],
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

  // Resizes an image file down to a sensible max dimension and returns it
  // as a compressed JPEG Blob, so we're not uploading full-resolution
  // camera/phone photos.
  const resizeImage = (file, maxDim = 1400) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFile = (variantIndex, imageIndex) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slotKey = `${variantIndex}-${imageIndex}`;
    setUploadingSlot(slotKey);
    setFormError('');

    try {
      const blob = await resizeImage(file);
      const path = `${Date.now()}-${variantIndex}-${imageIndex}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      updateVariantImage(variantIndex, imageIndex, data.publicUrl);
    } catch (err) {
      console.error('Image upload failed.', err);
      setFormError(
        "Couldn't upload that photo — check your Supabase storage bucket/policies, or paste an image URL instead."
      );
    } finally {
      setUploadingSlot(null);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

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

    const ok = isEditing
      ? await updateProduct(initialValue.id, payload)
      : await addProduct(payload);

    setSubmitting(false);

    if (ok) {
      onDone();
    } else {
      setFormError("Couldn't save this product — please try again.");
    }
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
              {[0, 1, 2, 3, 4].map((imgIndex) => (
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
                    disabled={uploadingSlot === `${vIndex}-${imgIndex}`}
                  />
                  {uploadingSlot === `${vIndex}-${imgIndex}` && (
                    <p className="variant-image-uploading">Uploading&hellip;</p>
                  )}
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

      {formError && <p className="admin-error">{formError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-solid" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
