const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Create a new notification
 * @param {Object} data - Notification data
 * @returns {Object} - Created notification
 */
async function createNotification(data) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        metadata: data.metadata || {}
      }
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}

/**
 * Get all notifications for a user
 * @param {Number} userId - User ID
 * @returns {Array} - Array of notifications
 */
async function getNotifications(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return notifications;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new Error("Failed to get notifications");
  }
}

/**
 * Get all unread notifications for a user
 * @param {Number} userId - User ID
 * @returns {Array} - Array of unread notifications
 */
async function getUnreadNotifications(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return notifications;
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw new Error("Failed to get unread notifications");
  }
}

/**
 * Mark notifications as read
 * @param {Array} notificationIds - Array of notification IDs to mark as read
 * @returns {Object} - Update result
 */
async function markNotificationsAsRead(notificationIds) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        isRead: true
      }
    });
    return result;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw new Error("Failed to mark notifications as read");
  }
}

/**
 * Create order notification
 * @param {Object} order - Order data
 */
async function createOrderNotification(order) {
  const adminUsers = await prisma.user.findMany({
    where: {
      role: "ADMIN"
    }
  });

  for (const admin of adminUsers) {
    await createNotification({
      userId: admin.id,
      type: "ORDER",
      message: `New order #${order.id} placed for ₹${(order.totalDiscountedPrice/100).toLocaleString()}`,
      metadata: {
        orderId: order.id,
        totalAmount: order.totalDiscountedPrice
      }
    });
  }
}

/**
 * Create review notification
 * @param {Object} review - Review data
 */
async function createReviewNotification(review) {
  const adminUsers = await prisma.user.findMany({
    where: {
      role: "ADMIN"
    }
  });

  for (const admin of adminUsers) {
    await createNotification({
      userId: admin.id,
      type: "REVIEW",
      message: `New review added for product #${review.productId}`,
      metadata: {
        reviewId: review.id,
        productId: review.productId
      }
    });
  }
}

/**
 * Create low stock notification
 * @param {Object} product - Product data
 * @param {Object} size - Size data
 */
async function createLowStockNotification(product, size) {
  const adminUsers = await prisma.user.findMany({
    where: {
      role: "ADMIN"
    }
  });

  for (const admin of adminUsers) {
    await createNotification({
      userId: admin.id,
      type: "STOCK",
      message: `Low stock alert: ${product.title} (${size.name}) - Only ${size.quantity} left`,
      metadata: {
        productId: product.id,
        sizeId: size.id,
        quantity: size.quantity
      }
    });
  }
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationsAsRead,
  createOrderNotification,
  createReviewNotification,
  createLowStockNotification
};
