const paymentService = require("../services/payment.service.js");

const createPaymentOrder = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const paymentOrder = await paymentService.createPaymentOrder(req.params.id);
    return res.status(200).json({
      success: true,
      data: paymentOrder
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create payment order"
    });
  }
};

const updatePaymentInformation = async (req, res) => {
  try {
    if (!req.query.payment_id || !req.query.order_id || !req.query.razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID, Order ID, and Razorpay Order ID are required"
      });
    }

    await paymentService.updatePaymentInformation(req.query);
    return res.status(200).json({
      success: true,
      message: "Payment information updated successfully"
    });
  } catch (error) {
    console.error('Payment update error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update payment information"
    });
  }
};

module.exports = { createPaymentOrder, updatePaymentInformation };