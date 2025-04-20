const express = require("express");
const { authenticate } = require("../middleware/authenticat.js");
const router = express.Router();
const orderController = require("../controllers/order.controller.js")

router.post("/", authenticate, orderController.createOrder);
router.get("/user", authenticate, orderController.orderHistory);
router.get("/:id", authenticate, orderController.findOrderById);
router.put("/:id/payment", authenticate, orderController.placedOrder);

module.exports = router;