const prisma = require('../lib/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const [totalProducts, totalCategories, totalSuppliers, totalOrders, lowStockCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.order.count(),
      prisma.product.findMany({
        where: {
          minStock: { lte: threshold }
        }
      }).then(products => products.length)
    ]);

    const stats = {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalOrders,
      lowStockCount
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStock = await prisma.product.findMany({
      where: {
        minStock: { lte: threshold }
      },
      include: {
        inventory: true,
        category: true,
        supplier: true
      }
    });

    res.json(lowStock);
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      take: 10,
      include: {
        user: true,
        status: true
      }
    });

    res.json(recentOrders);
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