import React, { useState, useEffect } from 'react';
import { api } from '../../services/ApiService';
import CategoryForm from './CategoryForm';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/categories', {
        params: { search, page, limit },
      });
      setCategories(res.data.categories || []);
      const pagination = res.data.pagination || {};
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, page]);

  const handleCreate = async (data) => {
    try {
      await api.post('/categories', data);
      setSuccess('Category created successfully');
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError('Failed to create category');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.put(`/categories/${id}`, data);
      setSuccess('Category updated successfully');
      setShowForm(false);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError('Failed to delete category');
    }
  };

  const openCreate = () => {
    setEditCategory(null);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditCategory(category);
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div className="flex-1 mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-64"
          />
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Category
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.description || ''}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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
        <CategoryForm
          onSubmit={editCategory ? (data) => handleUpdate(editCategory.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditCategory(null);
          }}
          initialData={editCategory || {}}
          isEdit={!!editCategory}
        />
      )}
    </div>
  );
};

export default CategoriesPage;