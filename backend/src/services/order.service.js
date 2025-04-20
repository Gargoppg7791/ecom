const { PrismaClient } = require("@prisma/client");
const cartService = require("../services/cart.service.js");
const notificationService = require("./notification.service");

const prisma = new PrismaClient();

/**
 * Create a new order for a user
 * @param {Object} user - The user object
 * @param {Object} shippAddress - The shipping address object
 * @returns {Object} - The created order
 */
async function createOrder(user, shippAddress) {
  try {
    let address;
    if (shippAddress.id) {
      address = await prisma.address.findUnique({ where: { id: parseInt(shippAddress.id) } });
    } else {
      address = await prisma.address.create({
        data: {
          firstName: shippAddress.firstName,
          lastName: shippAddress.lastName,
          streetAddress: shippAddress.streetAddress,
          city: shippAddress.city,
          state: shippAddress.state,
          zipCode: shippAddress.zipCode,
          userId: user.id,
          mobile: shippAddress.mobile
        },
      });
    }

    const cart = await cartService.findUserCart(user.id);
    const orderItemsData = cart.cartItems.map(item => ({
      price: item.price,
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      userId: item.userId,
      discountedPrice: item.discountedPrice,
    }));

    const totalPrice =  cart.totalPrice - cart.discount;

    const createdOrder = await prisma.order.create({
      data: {
        userId: user.id,
        orderItems: {
          create: orderItemsData,
        },
        totalPrice: totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice,
        discount: cart.discount,
        totalItem: cart.totalItem,
        shippingAddressId: address.id,
        orderDate: new Date(),
        orderStatus: "PENDING",
        payments: {
          create: {
            userId: user.id,
            paymentStatus: "PENDING",
          },
        },
        createdAt: new Date(),
      },
      include: {
        orderItems: true,
        payments: true,
      },
    });

    // Create notification for admin
    await notificationService.createOrderNotification(createdOrder);

    return createdOrder;
  } catch (error) {
    console.error("Error creating order: ", error.message);
    throw new Error("Failed to create order: " + error.message);
  }
}

/**
 * Update order status to "PLACED" and payment status to "COMPLETED"
 * @param {Number} orderId - The order ID
 * @returns {Object} - The updated order
 */
async function placedOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    
    // If there are no payments, create a new one
    if (!order.payments || order.payments.length === 0) {
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          orderStatus: "PLACED",
          payments: {
            create: {
              userId: order.userId,
              paymentStatus: "COMPLETED",
            },
          },
        },
      });
      return updatedOrder;
    }

    // If there are existing payments, update the first one
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        orderStatus: "PLACED",
        payments: {
          update: {
            where: { id: order.payments[0].id },
            data: { paymentStatus: "COMPLETED" },
          },
        },
      },
    });
    return updatedOrder;
  } catch (error) {
    console.error("Error placing order: ", error.message);
    throw new Error("Failed to place order: " + error.message);
  }
}

/**
 * Update order status to "CONFIRMED"
 * @param {Number} orderId - The order ID
 * @returns {Object} - The updated order
 */
async function confirmedOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { orderStatus: "CONFIRMED" },
    });
    return updatedOrder;
  } catch (error) {
    console.error("Error confirming order: ", error.message);
    throw new Error("Failed to confirm order: " + error.message);
  }
}

/**
 * Update order status to "SHIPPED"
 * @param {Number} orderId - The order ID
 * @returns {Object} - The updated order
 */
async function shipOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { orderStatus: "SHIPPED" },
    });
    return updatedOrder;
  } catch (error) {
    console.error("Error shipping order: ", error.message);
    throw new Error("Failed to ship order: " + error.message);
  }
}

/**
 * Update order status to "DELIVERED"
 * @param {Number} orderId - The order ID
 * @returns {Object} - The updated order
 */
async function deliveredOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { orderStatus: "DELIVERED" },
    });
    return updatedOrder;
  } catch (error) {
    console.error("Error delivering order: ", error.message);
    throw new Error("Failed to deliver order: " + error.message);
  }
}

/**
 * Update order status to "CANCELLED"
 * @param {Number} orderId - The order ID
 * @returns {Object} - The updated order
 */
async function cancelledOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { orderStatus: "CANCELLED" },
    });
    return updatedOrder;
  } catch (error) {
    console.error("Error cancelling order: ", error.message);
    throw new Error("Failed to cancel order: " + error.message);
  }
}

/**
 * Find an order by its ID
 * @param {Number} orderId - The order ID
 * @returns {Object} - The found order
 */
async function findOrderById(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        orderItems: { 
          include: { 
            product: {
              include: {
                color: {
                  select: {
                    name: true,
                    photos: true
                  }
                }
              }
            } 
          } 
        },
        shippingAddress: true,
        payments: true,
      },
    });
    return order;
  } catch (error) {
    console.error("Error finding order: ", error.message);
    throw new Error("Failed to find order: " + error.message);
  }
}

/**
 * Get order history for a user
 * @param {Number} userId - The user ID
 * @returns {Array} - The user's order history
 */
async function usersOrderHistory(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        orderItems: { 
          include: { 
            product: {
              include: {
                color: {
                  select: {
                    name: true,
                    photos: true
                  }
                }
              }
            } 
          } 
        },
        shippingAddress: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders || [];
  } catch (error) {
    console.error("Error retrieving order history: ", error.message);
    throw new Error("Failed to retrieve order history: " + error.message);
  }
}

/**
 * Get all orders
 * @returns {Array} - All orders
 */
async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: { 
          include: { 
            product: {
              include: {
                color: {
                  select: {
                    name: true,
                    photos: true
                  }
                }
              }
            } 
          } 
        },
      },
    });
    return orders;
  } catch (error) {
    console.error("Error retrieving all orders: ", error.message);
    throw new Error("Failed to retrieve all orders: " + error.message);
  }
}

/**
 * Delete an order by its ID
 * @param {Number} orderId - The order ID
 */
async function deleteOrder(orderId) {
  try {
    const order = await findOrderById(orderId);
    if (!order) throw new Error("Order not found with id " + orderId);

    await prisma.order.delete({ where: { id: parseInt(orderId) } });
  } catch (error) {
    console.error("Error deleting order: ", error.message);
    throw new Error("Failed to delete order: " + error.message);
  }
}

module.exports = {
  createOrder,
  placedOrder,
  confirmedOrder,
  shipOrder,
  deliveredOrder,
  cancelledOrder,
  findOrderById,
  usersOrderHistory,
  getAllOrders,
  deleteOrder,
};