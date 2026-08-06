const express = require('express');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerSales,
  getCustomerReturns,
  getCustomerStats,
} = require('../controllers/customerController');

const router = express.Router();

// Customer CRUD routes
router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Customer sub-resource routes
router.get('/:id/orders', getCustomerOrders);
router.get('/:id/sales', getCustomerSales);
router.get('/:id/returns', getCustomerReturns);

module.exports = router;
