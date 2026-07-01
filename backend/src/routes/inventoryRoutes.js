const express = require('express');
const { auth } = require('../middleware/auth');
const { inventoryController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/inventory', inventoryController.getAllInventory);
router.get('/inventory/:productId', inventoryController.getInventoryByProductId);

// Protected routes
router.post('/inventory/adjust', auth, inventoryController.adjustStock);
router.post('/inventory/transfer', auth, inventoryController.transferStock);
router.get('/inventory/movements', auth, inventoryController.getStockMovements);
router.get('/inventory/report', auth, inventoryController.getInventoryReport);

module.exports = router;