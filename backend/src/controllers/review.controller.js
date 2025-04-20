const reviewService = require('../services/review.service.js');
const multer = require('multer');
const upload = multer();

const createReview = async (req, res) => {
  try {
    const user = req.user;
    const reqBody = req.body;
    const files = req.files;

    console.log("Review request received:", {
      body: reqBody,
      user: user ? { id: user.id } : null,
      headers: req.headers,
      files: files?.length
    });

    if (!user || !user.id) {
      console.error("User not authenticated");
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate request body
    if (!reqBody) {
      console.error("Request body is empty");
      return res.status(400).json({ error: 'Request body is required' });
    }

    if (!reqBody.productId) {
      console.error("Product ID is missing");
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!reqBody.review) {
      console.error("Review text is missing");
      return res.status(400).json({ error: 'Review text is required' });
    }

    // Validate productId is a number
    const productId = parseInt(reqBody.productId, 10);
    if (isNaN(productId)) {
      console.error("Invalid product ID:", reqBody.productId);
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Validate rating if provided
    if (reqBody.rating !== undefined) {
      const rating = parseFloat(reqBody.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        console.error("Invalid rating value:", reqBody.rating);
        return res.status(400).json({ error: 'Rating must be between 0 and 5' });
      }
    }

    // Add images to request data if present
    const reviewData = {
      ...reqBody,
      images: files || []
    };

    const review = await reviewService.createReview(reviewData, user);
    console.log("Review created/updated successfully:", review);
    
    return res.status(201).json(review);
  } catch (error) {
    console.error("Error in createReview controller:", error);
    
    // Handle specific error cases
    if (error.message === "Product not found") {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (error.message.includes("required")) {
      return res.status(400).json({ error: error.message });
    }
    
    // Default error response
    return res.status(500).json({ 
      error: 'Failed to create/update review',
      details: error.message 
    });
  }
};

const getAllReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("Getting reviews for product:", productId);

    if (!productId || isNaN(parseInt(productId, 10))) {
      console.error("Invalid product ID:", productId);
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const reviews = await reviewService.getAllReview(productId);
    console.log("Reviews retrieved successfully:", reviews);
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getAllReview controller:", error);
    
    // Handle specific error cases
    if (error.message === "Product not found") {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (error.message.includes("required")) {
      return res.status(400).json({ error: error.message });
    }
    
    // Default error response
    return res.status(500).json({ 
      error: 'Failed to retrieve reviews',
      details: error.message 
    });
  }
};

module.exports = { createReview, getAllReview };