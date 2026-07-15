import React, { useState, useEffect } from 'react';
import { api } from '../../services/ApiService';

/**
 * ProductForm is a reusable form component for creating and editing products.
 * It accepts an optional `initialData` prop to pre‑populate the form for editing.
 * The component calls `onSubmit` with the form data when the user submits.
 * `onCancel` is called when the user wants to close the form without saving.
 */
const ProductForm = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
}) => {
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    barcode: '',
    imageUrl: '',
    minStock: 10,
    maxStock: 1000,
    isActive: true,
    categoryId: '',
    supplierId: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        sku: initialData.sku || '',
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        cost: initialData.cost || '',
        barcode: initialData.barcode || '',
        imageUrl: initialData.imageUrl || '',
        minStock: initialData.minStock || 10,
        maxStock: initialData.maxStock || 1000,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        categoryId: initialData.categoryId || '',
        supplierId: initialData.supplierId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? 'Edit Product' : 'Create Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost</label>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Stock</label>
              <input
                type="number"
                name="minStock"
                value={form.minStock}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Stock</label>
              <input
                type="number"
                name="maxStock"
                value={form.maxStock}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Category ID</label>
              <input
                type="text"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier ID</label>
              <input
                type="text"
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex items-center">
            <label className="mr-2">Active</label>
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
