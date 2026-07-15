import React, { useState, useEffect } from 'react';
import { api } from '../../services/ApiService';
import ProductForm from './ProductForm';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products', {
        params: { search, page, limit },
      });
      setProducts(res.data.products || []);
      const pagination = res.data.pagination || {};
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  const handleCreate = async (data) => {
    try {
      await api.post('/products', data);
      setSuccess('Product created successfully');
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to create product');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.put(`/products/${id}`, data);
      setSuccess('Product updated successfully');
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccess('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    }
  };

  const openCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div className="flex-1 mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-64"
          />
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Product
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.sku}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {p.inventory ? p.inventory.quantity : 'N/A'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
      {showForm && (
        <ProductForm
          onSubmit={editProduct ? (data) => handleUpdate(editProduct.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditProduct(null);
          }}
          initialData={editProduct || {}}
          isEdit={!!editProduct}
        />
      )}
    </div>
  );
};

export default ProductsPage;