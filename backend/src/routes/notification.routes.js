const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticat.js");
const notificationController = require("../controllers/notification.controller.js");

// Get notifications
router.get("/", authenticate, notificationController.getNotifications);

// Mark notifications as read
router.put("/mark-read", authenticate, notificationController.markAsRead);

module.exports = router;
