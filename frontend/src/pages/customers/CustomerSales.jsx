import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';

const CustomerSales = ({ customerId }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSales();
  }, [customerId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCustomerSales(customerId);
      setSales(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch sales');
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading sales...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Sales</h3>
      {sales.length === 0 ? (
        <p>No sales found.</p>
      ) : (
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id} className="border p-2 rounded">
              <p>Sale #{sale.id}</p>
              <p>Date: {new Date(sale.createdAt).toLocaleDateString()}</p>
              <p>Total: ${sale.totalAmount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerSales;
