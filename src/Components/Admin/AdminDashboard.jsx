import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import ProductForm from './ProductForm';

export default function AdminDashboard({ onLogout }) {
  const { products, deleteProduct } = useProducts();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
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

      {mode === 'list' && (
        <>
          <div className="admin-toolbar">
            <span>{products.length} product{products.length === 1 ? '' : 's'}</span>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img className="admin-thumb" src={product.image} alt={product.name} />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>&#8377;{Number(product.price).toLocaleString('en-IN')}</td>
                    <td className="admin-desc-cell">{product.description}</td>
                    <td className="admin-row-actions">
                      <button className="btn" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn admin-danger" onClick={() => handleDelete(product)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty">
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
    </div>
  );
}
