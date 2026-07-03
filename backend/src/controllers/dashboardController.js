const prisma = require('../lib/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalOrders,
      lowStockProducts,
      recentOrders,
      recentMovements
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.order.count(),
      prisma.product.findMany({
        where: {
          isActive: true,
          inventory: {
            quantity: { lte: 10 } // Simplified condition for demo
          }
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { orderDate: 'desc' },
        include: {
          user: { select: { name: true } },
          supplier: { select: { name: true } }
        }
      }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } }
        }
      })
    ]);

    // Get inventory value
    const inventory = await prisma.inventory.findMany({
      include: { product: true }
    });
    
    const totalInventoryValue = inventory.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 0
    );

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Get low stock count
    const lowStockCount = await prisma.product.count({
      where: {
        isActive: true,
        inventory: {
          quantity: { lte: 10 } // Simplified condition for demo
        }
      }
    });

    res.json({
      stats: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        totalOrders,
        totalInventoryValue,
        lowStockCount
      },
      recentOrders,
      recentMovements,
      ordersByStatus
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        inventory: {
          quantity: { lte: 10 } // Simplified condition for demo
        }
      },
      include: {
        category: true,
        inventory: true,
        supplier: true
      },
      orderBy: { inventory: { quantity: 'asc' } }
    });

    res.json(products);
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const movements = await prisma.stockMovement.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true, email: true } }
      }
    });

    res.json(movements);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getLowStockAlerts,
  getRecentActivity
};