import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET single category by ID
router.get('/:id', categoryController.getCategoryById);

// POST new category
router.post('/', categoryController.createCategory);

// PUT update category
router.put('/:id', categoryController.updateCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

export default router;
