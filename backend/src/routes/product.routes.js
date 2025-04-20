const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller.js");

// Create a new product
router.post('/', productController.createProduct);

// Get all products with filtering and pagination
router.get('/', productController.getAllProducts);

// Search products
router.get('/search', productController.searchProduct);

// Get product by ID
router.get('/:id', productController.findProductById);

// Update product by ID
router.put('/:id', productController.updateProduct);

// Delete product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;