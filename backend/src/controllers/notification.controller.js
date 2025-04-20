const notificationService = require("../services/notification.service.js");

/**
 * Get notifications for the current user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getNotifications(userId);
    
    return res.status(200).json({
      success: true,
      data: notifications,
      message: "Notifications retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message
    });
  }
};

/**
 * Mark notifications as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification IDs provided"
      });
    }

    await notificationService.markNotificationsAsRead(notificationIds);
    
    return res.status(200).json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
