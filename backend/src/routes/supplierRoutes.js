const express = require('express');
const { auth } = require('../middleware/auth');
const { supplierController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);

// Protected routes
router.post('/', auth, supplierController.createSupplier);
router.put('/:id', auth, supplierController.updateSupplier);
router.delete('/:id', auth, supplierController.deleteSupplier);

module.exports = router;