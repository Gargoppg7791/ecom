const express = require("express");
const { authenticate } = require("../middleware/authenticat.js");
const router = express.Router();
const paymentController = require("../controllers/payment.controller.js");

// Create a Razorpay order
router.post("/:id", authenticate, paymentController.createPaymentOrder);

// Verify and update payment information
router.get("/verify", authenticate, paymentController.updatePaymentInformation);

module.exports = router;