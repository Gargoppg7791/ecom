const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {authenticate} = require('../middleware/authenticat');
// const isAdmin = require('../middleware/isAdmin');
// const isAdmin =require('../middleware/isAdmin.js');
// const isAdmin = true;
// ... existing routes ...

// Admin routes - all require authentication
router.use(authenticate);

// Get earnings data
router.get('/earnings', adminController.getEarnings);

// Get weekly earnings data
router.get('/weekly-earnings', adminController.getWeeklyEarnings);

// Get monthly earnings data
router.get('/monthly-earnings', adminController.getMonthlyEarnings);

// Get recent orders
router.get('/recent-orders', adminController.getRecentOrders);

// Dashboard Stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Sales Over Time
router.get('/sales-over-time', adminController.getSalesOverTime);

module.exports = router; 