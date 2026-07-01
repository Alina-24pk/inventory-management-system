const prisma = require('../lib/prisma');

const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true
      }
    });
    
    res.json(items);
  } catch (error) {
    console.error('Get order items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const { orderId, productId, quantity } = req.body;
    
    // Validate order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId }
    });
    if (!inventory || inventory.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Update order item
    const orderItem = await prisma.orderItem.update({
      where: { orderId_productId: { orderId, productId } },
      data: { quantity }
    });
    
    res.json(orderItem);
  } catch (error) {
    console.error('Update order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    
    // Validate order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete order item
    await prisma.orderItem.delete({
      where: { orderId_productId: { orderId, productId } }
    });
    
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    console.error('Delete order item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getOrderItems,
  updateOrderItem,
  deleteOrderItem
};