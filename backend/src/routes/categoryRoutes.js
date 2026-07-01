const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { categoryController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (admin and manager)
router.post('/', auth, authorize(['ADMIN', 'MANAGER']), categoryController.createCategory);
router.put('/:id', auth, authorize(['ADMIN', 'MANAGER']), categoryController.updateCategory);
router.delete('/:id', auth, authorize(['ADMIN', 'MANAGER']), categoryController.deleteCategory);

module.exports = router;