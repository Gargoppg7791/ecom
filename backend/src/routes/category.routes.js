const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/authenticat.js');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/children', categoryController.getChildCategories);

// Protected routes - Admin only
router.post('/', authenticate, categoryController.createCategory);
router.put('/:id', authenticate, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);
router.post('/:id/image', authenticate, categoryController.updateCategoryImage);
router.delete('/:id/image', authenticate, categoryController.deleteCategoryImage);

module.exports = router; 