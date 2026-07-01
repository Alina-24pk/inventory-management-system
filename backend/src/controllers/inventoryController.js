const prisma = require('../lib/prisma');

const getAllInventory = async (req, res) => {
  try {
    const { search, location, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: true
        },
        orderBy: { product: { name: 'asc' } },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventory.count({ where })
    ]);
    
    res.json({
      inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInventoryByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: true,
        movements: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    
    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { productId, quantity, reason, reference } = req.body;
    const userId = req.user.userId;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get current inventory
    let inventory = await prisma.inventory.findUnique({
      where: { productId }
    });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    
    // Calculate new quantity
    const newQuantity = inventory.quantity + quantity;
    
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        lastCountedAt: new Date()
      }
    });
    
    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        type: quantity > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(quantity),
        reason,
        reference,
        product: { connect: { id: productId } },
        inventory: { connect: { productId } },
        user: { connect: { id: userId } }
      }
    });
    
    res.json(updatedInventory);
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const transferStock = async (req, res) => {
  try {
    const { productId, fromLocation, toLocation, quantity, reason, reference } = req.body;
    const userId = req.user.userId;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId }
    });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    
    if (inventory.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Update inventory quantity
    await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: inventory.quantity - quantity,
        location: toLocation || inventory.location,
        lastCountedAt: new Date()
      }
    });
    
    // Create stock movement record for OUT
    await prisma.stockMovement.create({
      data: {
        type: 'OUT',
        quantity,
        reason,
        reference,
        product: { connect: { id: productId } },
        inventory: { connect: { productId } },
        user: { connect: { id: userId } }
      }
    });
    
    res.json({ message: 'Stock transferred successfully' });
  } catch (error) {
    console.error('Transfer stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStockMovements = async (req, res) => {
  try {
    const { productId, startDate, endDate, type } = req.query;
    
    const where = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    if (type) {
      where.type = type;
    }
    
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true }
        },
        inventory: {
          select: { id: true, location: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(movements);
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
            supplier: true
          }
        }
      }
    });
    
    // Calculate statistics
    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockProducts = inventory.filter(item => item.quantity <= item.product.minStock);
    const outOfStockProducts = inventory.filter(item => item.quantity === 0);
    
    const report = {
      totalProducts,
      totalQuantity,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      inventoryValue: inventory.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      lowStockProducts: lowStockProducts.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        currentStock: item.quantity,
        minStock: item.product.minStock,
        category: item.product.category.name,
        supplier: item.product.supplier?.name || 'N/A'
      })),
      outOfStockProducts: outOfStockProducts.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        category: item.product.category.name,
        supplier: item.product.supplier?.name || 'N/A'
      }))
    };
    
    res.json(report);
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllInventory,
  getInventoryByProductId,
  adjustStock,
  transferStock,
  getStockMovements,
  getInventoryReport
};