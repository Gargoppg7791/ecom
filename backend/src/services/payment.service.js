const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const razorpay = require("../config/razorpayClient");

const createPaymentOrder = async (orderId) => {
  try {
    const parsedOrderId = parseInt(orderId, 10);
    if (isNaN(parsedOrderId)) {
      throw new Error("Invalid order ID");
    }

    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(order.totalDiscountedPrice * 100);
    
    if (amountInPaise <= 0) {
      throw new Error("Invalid order amount");
    }

    console.log('Order amount:', {
      originalPrice: order.totalPrice,
      discountedPrice: order.totalDiscountedPrice,
      amountInPaise: amountInPaise,
      amountInRupees: amountInPaise / 100
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: order.userId.toString()
      }
    });

    if (!razorpayOrder || !razorpayOrder.id) {
      throw new Error("Failed to create Razorpay order");
    }

    const resData = {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID // This will be used in frontend to initialize checkout
    };
    return resData;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    if (error.statusCode === 400) {
      throw new Error(`Invalid order parameters: ${error.error?.description || error.message}`);
    } else if (error.statusCode === 401) {
      throw new Error("Invalid Razorpay credentials");
    } else if (error.statusCode === 429) {
      throw new Error("Too many requests. Please try again later");
    }
    throw new Error(error.message || "Failed to create payment order");
  }
};

const updatePaymentInformation = async (reqData) => {
  const paymentId = reqData.payment_id;
  const orderId = reqData.order_id;
  const razorpayOrderId = reqData.razorpay_order_id;

  if (!paymentId || !orderId || !razorpayOrderId) {
    throw new Error("Missing required payment information");
  }

  try {
    const parsedOrderId = parseInt(orderId, 10);
    if (isNaN(parsedOrderId)) {
      throw new Error("Invalid order ID");
    }

    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify the payment
    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Verify the order
    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);

    if (!razorpayOrder) {
      throw new Error("Razorpay order not found");
    }

    // Verify that the payment belongs to the order
    if (payment.order_id !== razorpayOrderId) {
      throw new Error("Payment does not match the order");
    }

    if (payment.status === 'captured') {
      await prisma.order.update({
        where: { id: parsedOrderId },
        data: {
          payments: {
            create: {
              paymentId: paymentId,
              paymentStatus: 'COMPLETED',
              paymentMethod: payment.method,
              transactionId: paymentId,
              user: {
                connect: {
                  id: order.userId
                }
              }
            },
          },
          orderStatus: 'PLACED',
        },
      });
    } else {
      throw new Error(`Payment status is ${payment.status}`);
    }

    const resData = { message: 'Your order is placed', success: true };
    return resData;
  } catch (error) {
    console.error('Error processing payment:', error);
    if (error.statusCode === 400) {
      throw new Error("Invalid payment verification parameters");
    } else if (error.statusCode === 401) {
      throw new Error("Invalid Razorpay credentials");
    } else if (error.statusCode === 404) {
      throw new Error("Payment or order not found");
    }
    throw new Error(error.message || "Failed to process payment");
  }
};

module.exports = { createPaymentOrder, updatePaymentInformation };