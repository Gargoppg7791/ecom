const { PrismaClient } = require("@prisma/client");
const productService = require("../services/product.service.js");

const prisma = new PrismaClient();

/**
 * Create or update a rating for a product
 * @param {Object} data - The rating data
 * @param {number} data.productId - The product ID
 * @param {number} data.rating - The rating value (1-5)
 * @param {number} data.userId - The user ID
 * @returns {Promise<Object>} - The created/updated rating
 */
const createRating = async (data) => {
    try {
        console.log("Creating rating with data:", data);

        // Validate input
        if (!data.productId || !data.rating || !data.userId) {
            throw new Error("Missing required fields: productId, rating, or userId");
        }

        if (data.rating < 1 || data.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Start transaction
        return await prisma.$transaction(async (tx) => {
            // Check if rating exists
            const existingRating = await tx.rating.findFirst({
                where: {
                    userId: data.userId,
                    productId: data.productId
                }
            });

            let ratingResult;
            if (existingRating) {
                // Update existing rating
                ratingResult = await tx.rating.update({
                    where: { id: existingRating.id },
                    data: { rating: data.rating }
                });
                console.log("Updated existing rating:", ratingResult);
            } else {
                // Create new rating
                ratingResult = await tx.rating.create({
                    data: {
                        userId: data.userId,
                        productId: data.productId,
                        rating: data.rating
                    }
                });
                console.log("Created new rating:", ratingResult);

                // Increment product's rating count
                await tx.product.update({
                    where: { id: data.productId },
                    data: { numRatings: { increment: 1 } }
                });
            }

            // Calculate new average rating
            const ratings = await tx.rating.findMany({
                where: { productId: data.productId },
                select: { rating: true }
            });

            const totalRatings = ratings.length;
            const averageRating = totalRatings > 0 
                ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings 
                : 0;

            // Update product's rating count
            await tx.product.update({
                where: { id: data.productId },
                data: { 
                    numRatings: totalRatings
                }
            });

            return {
                ...ratingResult,
                totalRatings,
                averageRating: Math.round(averageRating * 10) / 10
            };
        });
    } catch (error) {
        console.error("Error in createRating service:", error);
        throw error;
    }
};

/**
 * Get all ratings for a product
 * @param {number} productId - The product ID
 * @returns {Promise<Object>} - The ratings data
 */
const getProductRatings = async (productId) => {
    try {
        console.log("Getting ratings for product:", productId);

        // Get all ratings with user details
        const ratings = await prisma.rating.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get product details
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                numRatings: true
            }
        });

        if (!product) {
            throw new Error("Product not found");
        }

        // Initialize rating distribution with zeros
        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        // Calculate rating distribution only if there are ratings
        if (ratings.length > 0) {
            ratings.forEach(rating => {
                const roundedRating = Math.round(rating.rating);
                ratingDistribution[roundedRating]++;
            });
        }

        // Calculate percentages
        const totalRatings = ratings.length;
        const ratingPercentages = Object.entries(ratingDistribution).reduce((acc, [rating, count]) => {
            acc[rating] = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            return acc;
        }, {});

        // Calculate average rating
        const averageRating = totalRatings > 0 
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings 
            : 0;

        return {
            ratings,
            totalRatings,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            ratingPercentages
        };
    } catch (error) {
        console.error("Error in getProductRatings service:", error);
        throw error;
    }
};

/**
 * Get a user's rating for a product
 * @param {number} productId - The product ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object|null>} - The user's rating or null
 */
const getUserRating = async (productId, userId) => {
    try {
        console.log("Getting user rating:", { productId, userId });
        return await prisma.rating.findFirst({
            where: {
                productId,
                userId
            },
            select: {
                id: true,
                rating: true,
                createdAt: true
            }
        });
    } catch (error) {
        console.error("Error in getUserRating service:", error);
        throw error;
    }
};

module.exports = {
    createRating,
    getProductRatings,
    getUserRating
};