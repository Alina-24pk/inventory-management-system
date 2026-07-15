import prisma from '../lib/prisma';

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = await prisma.category.create({
      data: { name: name.trim() },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};