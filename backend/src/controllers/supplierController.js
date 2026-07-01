const prisma = require('../lib/prisma');

const getAllSuppliers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          products: true,
          orders: true
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.supplier.count({ where })
    ]);
    
    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        orders: true
      }
    });
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;
    
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        contactPerson
      }
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson } = req.body;
    
    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });
    
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        contactPerson
      }
    });
    
    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });
    
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // Check if supplier has products
    const productsCount = await prisma.product.count({
      where: { supplierId: id }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete supplier with existing products' 
      });
    }
    
    // Check if supplier has orders
    const ordersCount = await prisma.order.count({
      where: { supplierId: id }
    });
    
    if (ordersCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete supplier with existing orders' 
      });
    }
    
    await prisma.supplier.delete({
      where: { id }
    });
    
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};