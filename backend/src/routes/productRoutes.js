const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { productController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin and manager for create/update/delete)
router.post('/', auth, authorize(['ADMIN', 'MANAGER']), productController.createProduct);
router.put('/:id', auth, authorize(['ADMIN', 'MANAGER']), productController.updateProduct);
router.delete('/:id', auth, authorize(['ADMIN', 'MANAGER']), productController.deleteProduct);

module.exports = router;