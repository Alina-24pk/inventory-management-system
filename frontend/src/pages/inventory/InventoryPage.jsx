import React, { useState, useEffect } from 'react';
import { api } from '../../services/ApiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Report data
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // Movements data
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsError, setMovementsError] = useState('');
  const [showMovements, setShowMovements] = useState(false);

  // Operations modal state
  const [activeOperation, setActiveOperation] = useState(null); // 'adjust' | 'transfer' | null
  const [operationError, setOperationError] = useState('');
  const [operationSuccess, setOperationSuccess] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchInventory = async (opts = {}) => {
    const pg = opts.page !== undefined ? opts.page : page;
    const srch = opts.search !== undefined ? opts.search : search;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory', {
        params: { search: srch, page: pg, limit },
      });
      setInventory(res.data.inventory || []);
      const pagination = res.data.pagination || {};
      setTotalPages(pagination.pages || 1);
      setTotal(pagination.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const res = await api.get('/inventory/report');
      setReport(res.data || null);
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setReportError('Not authorized to view report');
      } else {
        setReportError('Failed to load report');
      }
    } finally {
      setReportLoading(false);
    }
  };

  const fetchMovements = async () => {
    setMovementsLoading(true);
    setMovementsError('');
    try {
      const res = await api.get('/inventory/movements');
      setMovements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setMovementsError('Not authorized to view movements');
      } else {
        setMovementsError('Failed to load movements');
      }
    } finally {
      setMovementsLoading(false);
    }
  };

  const refreshInventory = () => {
    fetchInventory({ reset: true });
  };

  // Fetch inventory on mount and when search or page changes
  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // Fetch report and movements in parallel (once, when auth is ready)
  useEffect(() => {
    fetchReport();
    fetchMovements();
  }, []);

  const handleAdjustSubmit = async (e, formData) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError('');
    setOperationSuccess('');
    try {
      await api.post('/inventory/adjust', formData);
      setOperationSuccess('Stock adjusted successfully');
      setActiveOperation(null);
      refreshInventory();
      fetchReport();
      fetchMovements();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setOperationError(err.response.data?.error || 'Product or inventory not found');
      } else if (err.response && err.response.status === 400) {
        setOperationError(err.response.data?.error || 'Invalid adjustment');
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setOperationError('Not authorized to adjust stock');
      } else {
        setOperationError('Failed to adjust stock');
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransferSubmit = async (e, formData) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError('');
    setOperationSuccess('');
    try {
      await api.post('/inventory/transfer', formData);
      setOperationSuccess('Stock transferred successfully');
      setActiveOperation(null);
      refreshInventory();
      fetchReport();
      fetchMovements();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setOperationError(err.response.data?.error || 'Product or inventory not found');
      } else if (err.response && err.response.status === 400) {
        setOperationError(err.response.data?.error || 'Invalid transfer');
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setOperationError('Not authorized to transfer stock');
      } else {
        setOperationError('Failed to transfer stock');
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const resetForm = () => {
    setOperationError('');
    setOperationSuccess('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      {/* Operation feedback */}
      {operationError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{operationError}</div>
      )}
      {operationSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{operationSuccess}</div>
      )}

      {/* Overview / Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Inventory Records</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Stock Quantity</p>
          <p className="text-2xl font-bold">
            {report ? report.totalQuantity : loading ? '...' : '-'}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">
            {reportLoading ? '...' : reportError ? '-' : report?.lowStockCount ?? '-'}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {reportLoading ? '...' : reportError ? '-' : report?.outOfStockCount ?? '-'}
          </p>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded shadow mb-6">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg font-semibold">Inventory List</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-1 w-full sm:w-48"
            />
            <button
              onClick={refreshInventory}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowMovements(!showMovements)}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              {showMovements ? 'Hide Movements' : 'Show Movements'}
            </button>
          </div>
        </div>
          </div>

        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : inventory.length === 0 ? (
          <div className="p-4 text-gray-500">No inventory records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Last Counted</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => {
                  const product = item.product || {};
                  const isLowStock =
                    report && item.quantity <= product.minStock && item.quantity > 0;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <tr key={item.id} className={isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{product.name || 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{product.sku || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{item.location || '-'}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={isLowStock || isOutOfStock ? 'text-red-700 font-medium' : ''}>
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <span className="ml-1 text-xs text-orange-600">⚠ Low</span>
                        )}
                        {isOutOfStock && (
                          <span className="ml-1 text-xs text-red-600">Out of stock</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {item.lastCountedAt
                          ? new Date(item.lastCountedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-x-1">
                          <button
                            onClick={() => {
                              setActiveOperation({ type: 'adjust', productId: item.productId, product });
                              resetForm();
                            }}
                            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setActiveOperation({ type: 'transfer', productId: item.productId, product });
                              resetForm();
                            }}
                            className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                          >
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages} ({total} records)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
{/* Movements section */}
      {showMovements && (
        <div className="bg-white rounded shadow mb-6 p-4">
          <h2 className="text-lg font-semibold mb-3">Stock Movements</h2>
          {movementsLoading ? (
            <LoadingSpinner />
          ) : movementsError ? (
            <div className="text-red-600">{movementsError}</div>
          ) : movements.length === 0 ? (
            <div className="text-gray-500">No stock movements recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded ${
                            m.type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : m.type === 'OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{m.product?.name || 'Unknown'}</td>
                      <td className="px-4 py-2 text-gray-600">{m.product?.sku || '-'}</td>
                      <td className="px-4 py-2 text-right">{m.quantity}</td>
                      <td className="px-4 py-2 text-gray-600">{m.inventory?.location || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{m.reason || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{m.reference || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{m.user?.name || '-'}</td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Operations Modal: Adjust Stock */}
      {activeOperation?.type === 'adjust' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-2">
            <h2 className="text-xl font-bold mb-4">
              Adjust Stock: {activeOperation.product?.name || 'Unknown'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">SKU: {activeOperation.product?.sku || '-'}</p>
            <form
              onSubmit={(e) => {
                const quantity = parseInt(e.target.elements.quantity.value, 10);
                if (isNaN(quantity)) {
                  e.preventDefault();
                  setOperationError('Quantity must be a number');
                  return;
                }
                handleAdjustSubmit(e, {
                  productId: activeOperation.productId,
                  quantity,
                  reason: e.target.elements.reason.value,
                  reference: e.target.elements.reference.value,
                });
              }}
            >
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. +50 or -10"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Positive to add stock, negative to remove stock.
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Stock count, damaged goods"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Reference</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="e.g. INV-001, PO-123"
                  defaultValue={''}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {operationError && (
                <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{operationError}</div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOperation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {operationLoading ? '...' : 'Adjust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operations Modal: Transfer Stock */}
      {activeOperation?.type === 'transfer' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-2">
            <h2 className="text-xl font-bold mb-4">
              Transfer Stock: {activeOperation.product?.name || 'Unknown'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">SKU: {activeOperation.product?.sku || '-'}</p>
            <form
              onSubmit={(e) => {
                const quantity = parseInt(e.target.elements.quantity.value, 10);
                const fromLocation = e.target.elements.fromLocation.value;
                const toLocation = e.target.elements.toLocation.value;
                if (isNaN(quantity)) {
                  e.preventDefault();
                  setOperationError('Quantity must be a number');
                  return;
                }
                if (quantity <= 0) {
                  e.preventDefault();
                  setOperationError('Transfer quantity must be greater than 0');
                  return;
                }
                if (!fromLocation || !toLocation) {
                  e.preventDefault();
                  setOperationError('From and To locations are required');
                  return;
                }
                if (fromLocation === toLocation) {
                  e.preventDefault();
                  setOperationError('From and To locations must differ');
                  return;
                }
                handleTransferSubmit(e, {
                  productId: activeOperation.productId,
                  fromLocation,
                  toLocation,
                  quantity,
                  reason: e.target.elements.reason.value,
                  reference: e.target.elements.reference.value,
                });
              }}
            >
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 50"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">From Location</label>
                <input
                  type="text"
                  name="fromLocation"
                  placeholder="Current warehouse/location"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">To Location</label>
                <input
                  type="text"
                  name="toLocation"
                  placeholder="Destination warehouse/location"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Relocation, re-stock"
                  defaultValue={''}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Reference</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="e.g. TRN-001"
                  defaultValue={''}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {operationError && (
                <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{operationError}</div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOperation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {operationLoading ? '...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

