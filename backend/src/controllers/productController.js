const prisma = require('../lib/prisma');

const getAllProducts = async (req, res) => {
  try {
    const { search, categoryId, supplierId, isActive, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (supplierId) {
      where.supplierId = supplierId;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
          inventory: true
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventory: true,
        orderItems: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { sku, name, description, price, cost, barcode, imageUrl, minStock, maxStock, isActive, categoryId, supplierId } = req.body;
    
    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku }
    });
    
    if (existingSku) {
      return res.status(400).json({ error: 'Product SKU already exists' });
    }
    
    // Check if barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode }
      });
      
      if (existingBarcode) {
        return res.status(400).json({ error: 'Product barcode already exists' });
      }
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if supplier exists (if provided)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
      });
      
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
    }
    
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        price,
        cost,
        barcode,
        imageUrl,
        minStock,
        maxStock,
        isActive,
        category: { connect: { id: categoryId } },
        supplier: supplierId ? { connect: { id: supplierId } } : undefined
      },
      include: {
        category: true,
        supplier: true
      }
    });
    
    // Create inventory record
    await prisma.inventory.create({
      data: {
        quantity: 0,
        product: { connect: { id: product.id } }
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, description, price, cost, barcode, imageUrl, minStock, maxStock, isActive, categoryId, supplierId } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if new SKU conflicts with existing product
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku }
      });
      
      if (skuConflict) {
        return res.status(400).json({ error: 'Product SKU already exists' });
      }
    }
    
    // Check if new barcode conflicts with existing product (if provided)
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeConflict = await prisma.product.findUnique({
        where: { barcode }
      });
      
      if (barcodeConflict) {
        return res.status(400).json({ error: 'Product barcode already exists' });
      }
    }
    
    // Check if category exists (if provided)
    if (categoryId && categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    
    // Check if supplier exists (if provided)
    if (supplierId !== undefined) {
      if (supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId }
        });
        
        if (!supplier) {
          return res.status(404).json({ error: 'Supplier not found' });
        }
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        name,
        description,
        price,
        cost,
        barcode,
        imageUrl,
        minStock,
        maxStock,
        isActive,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        supplier: supplierId ? { connect: { id: supplierId } } : { disconnect: true }
      },
      include: {
        category: true,
        supplier: true
      }
    });
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product has inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId: id }
    });
    
    if (inventory) {
      return res.status(400).json({ 
        error: 'Cannot delete product with existing inventory' 
      });
    }
    
    // Check if product has order items
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });
    
    if (orderItemsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with existing order items' 
      });
    }
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const products = await prisma.product.findMany({
      where: {
        minStock: {
          lt: parseInt(threshold)
        }
      },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { minStock: 'asc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};