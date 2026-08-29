import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '',
};

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
        image: initialValue.image,
      });
    } else {
      setForm({ ...EMPTY_FORM, category: categories[0] || '' });
    }
  }, [initialValue, categories]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price) || 0,
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

      <div className="form-row">
        <label htmlFor="pf-image-url">Image URL</label>
        <input
          id="pf-image-url"
          type="text"
          placeholder="https://..."
          value={form.image}
          onChange={handleChange('image')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="pf-image-file">Or upload an image</label>
        <input id="pf-image-file" type="file" accept="image/*" onChange={handleImageFile} />
      </div>

      {form.image && (
        <div className="form-preview">
          <img src={form.image} alt="Preview" />
        </div>
      )}

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
