const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticat.js");
const ratingController = require("../controllers/rating.controller.js");

// Create or update a rating
router.post("/create", authenticate, ratingController.createRating);

// Get ratings for a product
router.get("/product/:productId", ratingController.getProductRatings);

module.exports = router;