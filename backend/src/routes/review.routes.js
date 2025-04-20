const express = require("express");
const { authenticate } = require("../middleware/authenticat.js");
const router = express.Router();
const reviewController = require("../controllers/review.controller.js");
const multer = require('multer');
const upload = multer();

// Create review requires authentication
router.post("/create", authenticate, upload.array('images', 5), reviewController.createReview);

// Getting reviews should be public
router.get("/product/:productId", reviewController.getAllReview);

module.exports = router;