// Controllers index file
const authController = require('./authController');
const categoryController = require('./categoryController');
const productController = require('./productController');
const inventoryController = require('./inventoryController');
const orderController = require('./orderController');
const supplierController = require('./supplierController');

module.exports = {
  authController,
  categoryController,
  productController,
  inventoryController,
  orderController,
  supplierController
};