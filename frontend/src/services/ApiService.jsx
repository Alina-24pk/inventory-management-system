import axios from 'axios';

export const getCustomers = async () => {
  const response = await axios.get('/customers');
  return response.data;
};

export const getCustomer = async (customerId) => {
  const response = await axios.get(`/customers/${customerId}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await axios.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await axios.put(`/customers/${customerId}`, customerData);
  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await axios.delete(`/customers/${customerId}`);
  return response.data;
};

export const getCustomerOrders = async (customerId) => {
  const response = await axios.get(`/customers/${customerId}/orders`);
  return response.data;
};

export const getCustomerSales = async (customerId) => {
  const response = await axios.get(`/customers/${customerId}/sales`);
  return response.data;
};

export const getCustomerReturns = async (customerId) => {
  const response = await axios.get(`/customers/${customerId}/returns`);
  return response.data;
};

export const getCustomerStats = async () => {
  const response = await axios.get('/customers/stats');
  return response.data;
};