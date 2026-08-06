import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';

const CustomerDetailPage = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCustomer(customerId);
      setCustomer(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch customer details');
      toast.error('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BLOCKED: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customer Profile</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="text-2xl">&times;</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 px-4 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-2 px-4 font-medium ${activeTab === 'sales' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Sales
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-2 px-4 font-medium ${activeTab === 'returns' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Returns
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">Personal Information</h4>
              <p><strong>Customer Code:</strong> {customer.customerCode}</p>
              <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Alternate Phone:</strong> {customer.alternatePhone || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Company Information</h4>
              <p><strong>Company:</strong> {customer.companyName || 'N/A'}</p>
              <p><strong>Tax Number:</strong> {customer.taxNumber || 'N/A'}</p>
              <p><strong>Credit Limit:</strong> ${Number(customer.creditLimit || 0).toFixed(2)}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(customer.status)}`}>{customer.status}</span></p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Address</h4>
              <p>{customer.address}</p>
              <p>{customer.city}, {customer.state} {customer.postalCode}</p>
              <p>{customer.country}</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Financial Summary</h4>
              <p><strong>Current Balance:</strong> ${Number(customer.currentBalance).toFixed(2)}</p>
              <p><strong>Loyalty Points:</strong> {customer.loyaltyPoints}</p>
              <p><strong>Total Purchases:</strong> ${Number(customer.totalPurchases).toFixed(2)}</p>
              <p><strong>Total Orders:</strong> {customer.totalOrders}</p>
            </div>
          </div>
          {customer.notes && (
            <div>
              <h4 className="font-bold mb-2">Notes</h4>
              <p>{customer.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h4 className="font-bold mb-4">Order History</h4>
          <p className="text-gray-500">Orders would be displayed here</p>
        </div>
      )}

      {activeTab === 'sales' && (
        <div>
          <h4 className="font-bold mb-4">Sales History</h4>
          <p className="text-gray-500">Sales would be displayed here</p>
        </div>
      )}

      {activeTab === 'returns' && (
        <div>
          <h4 className="font-bold mb-4">Return History</h4>
          <p className="text-gray-500">Returns would be displayed here</p>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;