const ratingService = require("../services/rating.service");

/**
 * Create or update a rating
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createRating = async (req, res) => {
    try {
        const { productId, rating } = req.body;
        const userId = req.user.id;

        console.log("Creating rating request:", { productId, rating, userId });

        // Validate input
        if (!productId || !rating) {
            return res.status(400).json({ error: "Product ID and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Create rating using service
        const result = await ratingService.createRating({
            productId: parseInt(productId),
            rating: parseFloat(rating),
            userId
        });

        res.status(201).json({
            message: "Rating submitted successfully",
            ...result
        });
    } catch (error) {
        console.error("Error in createRating controller:", error);
        res.status(500).json({ error: error.message || "Error creating rating" });
    }
};

/**
 * Get ratings for a product
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getProductRatings = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;

        console.log("Getting product ratings:", { productId, userId });

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Get product ratings
        const ratingsData = await ratingService.getProductRatings(parseInt(productId));

        // Get user's rating if logged in
        let userRating = null;
        if (userId) {
            userRating = await ratingService.getUserRating(parseInt(productId), userId);
        }

        res.status(200).json({
            ...ratingsData,
            userRating: userRating?.rating || null
        });
    } catch (error) {
        console.error("Error in getProductRatings controller:", error);
        res.status(500).json({ error: error.message || "Error fetching ratings" });
    }
};

module.exports = {
    createRating,
    getProductRatings
};