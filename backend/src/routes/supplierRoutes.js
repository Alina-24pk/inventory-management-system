const express = require('express');
const { auth } = require('../middleware/auth');
const { supplierController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierById);

// Protected routes
router.post('/suppliers', auth, supplierController.createSupplier);
router.put('/suppliers/:id', auth, supplierController.updateSupplier);
router.delete('/suppliers/:id', auth, supplierController.deleteSupplier);

module.exports = router;