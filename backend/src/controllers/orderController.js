const prisma = require('../lib/prisma');

const getAllOrders = async (req, res) => {
  try {
    const { status, userId, supplierId, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (supplierId) {
      where.supplierId = supplierId;
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: true,
          supplier: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { userId, supplierId, items } = req.body;
    
    // Validate user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate supplier (if provided)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
      });
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
    }
    
    // Validate order items
    const validatedItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      
      // Check inventory
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId }
      });
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.productId}` });
      }
      
      validatedItems.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity
      });
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
        items: validatedItems
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate order
    const order = await prisma.order.findUnique({
      where: { id }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update status if provided
    if (status) {
      // Validate status transition
      const currentStatus = order.status;
      if (status !== currentStatus) {
        // Implement status transition logic here
        // For example, PENDING -> CONFIRMED
        if (currentStatus === 'PENDING' && status === 'CONFIRMED') {
          // Update status
          order.status = status;
        } else {
          return res.status(400).json({ error: 'Invalid status transition' });
        }
      }
    }
    
    // Update notes if provided
    if (notes) {
      order.notes = notes;
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate order
    const order = await prisma.order.findUnique({
      where: { id }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order has items
    const orderItemsCount = await prisma.orderItem.count({
      where: { orderId: id }
    });
    
    if (orderItemsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete order with existing items' 
      });
    }
    
    await order.delete();
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};