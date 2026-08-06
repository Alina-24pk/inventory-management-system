import React, { useEffect, useState } from 'react';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';

const CustomerReturns = ({ customerId }) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [customerId]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCustomerReturns(customerId);
      setReturns(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch returns');
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading returns...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Returns</h3>
      {returns.length === 0 ? (
        <p>No returns found.</p>
      ) : (
        <ul className="space-y-2">
          {returns.map((ret) => (
            <li key={ret.id} className="border p-2 rounded">
              <p>Return #{ret.id}</p>
              <p>Date: {new Date(ret.createdAt).toLocaleDateString()}</p>
              <p>Reason: {ret.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerReturns;
