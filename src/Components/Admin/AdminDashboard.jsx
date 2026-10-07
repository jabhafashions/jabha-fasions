import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import ProductForm from './ProductForm';
import CategoriesPanel from './CategoriesPanel';
import OrdersPanel from './OrdersPanel';
import './OrdersPanel.css';

export default function AdminDashboard({ onLogout }) {
  const { products, deleteProduct, error, loading } = useProducts();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [tab, setTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);

  const startAdd = () => {
    setEditingProduct(null);
    setMode('add');
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setMode('edit');
  };

  const backToList = () => {
    setMode('list');
    setEditingProduct(null);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Remove "${product.name}" from the catalogue?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Jabha Fashions — Admin</h1>
          <p>Manage the products shown on your site.</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="btn">View Site</Link>
          <button className="btn" onClick={onLogout}>Log Out</button>
        </div>
      </header>

      {error && <div className="admin-banner admin-banner-error">{error}</div>}

      <div className="admin-tabs">
        <button
          className={tab === 'products' ? 'is-active' : ''}
          onClick={() => setTab('products')}
        >
          Products
        </button>
        <button
          className={tab === 'orders' ? 'is-active' : ''}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      {tab === 'orders' ? (
        <OrdersPanel />
      ) : (
        <>
          {mode === 'list' && (
            <>
              <CategoriesPanel />
              <div className="admin-toolbar">
                <span>
                  {loading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'}`}
                </span>
                <button className="btn btn-solid" onClick={startAdd}>
                  + Add New Product
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Colors</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            className="admin-thumb"
                            src={product.variants?.[0]?.images?.[0] || ''}
                            alt={product.name}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>&#8377;{Number(product.price).toLocaleString('en-IN')}</td>
                        <td className="admin-desc-cell">{product.description}</td>
                        <td>
                          {(product.variants || []).map((v) => (
                            <span
                              key={v.id}
                              className="admin-swatch-dot"
                              style={{ backgroundColor: v.hex || '#ccc' }}
                              title={v.color}
                            />
                          ))}
                        </td>
                        <td className="admin-row-actions">
                          <button className="btn" onClick={() => startEdit(product)}>Edit</button>
                          <button className="btn admin-danger" onClick={() => handleDelete(product)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          No products yet — add your first one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <ProductForm
              initialValue={editingProduct}
              onDone={backToList}
              onCancel={backToList}
            />
          )}
        </>
      )}
    </div>
  );
}
