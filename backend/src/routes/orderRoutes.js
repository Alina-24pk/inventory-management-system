const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { orderController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Protected routes
router.post('/', auth, orderController.createOrder);
router.put('/:id', auth, orderController.updateOrder);
router.delete('/:id', auth, authorize(['ADMIN', 'MANAGER']), orderController.deleteOrder);

module.exports = router;