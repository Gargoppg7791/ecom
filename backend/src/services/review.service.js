const { PrismaClient } = require("@prisma/client");
const productService = require("../services/product.service.js");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const notificationService = require("./notification.service");

const prisma = new PrismaClient();

/**
 * Save uploaded images to the reviews directory
 * @param {Array} images - Array of image files
 * @returns {Array} - Array of saved image paths
 */
async function saveReviewImages(images) {
  const savedImages = [];
  const reviewsDir = path.join(__dirname, '../images/reviews');

  // Ensure reviews directory exists
  if (!fs.existsSync(reviewsDir)) {
    fs.mkdirSync(reviewsDir, { recursive: true });
  }

  for (const image of images) {
    const extension = path.extname(image.originalname);
    const filename = `${uuidv4()}${extension}`;
    const filepath = path.join(reviewsDir, filename);

    // Save the file
    await fs.promises.writeFile(filepath, image.buffer);
    savedImages.push(filename);
  }

  return savedImages;
}

/**
 * Create a new review
 * @param {Object} reqData - The request data containing the review details
 * @param {Object} user - The user object
 * @returns {Object} - The created review
 */
async function createReview(reqData, user) {
  try {
    console.log("Creating review with data:", {
      productId: reqData.productId,
      review: reqData.review,
      rating: reqData.rating,
      userId: user.id,
      hasImages: reqData.images?.length > 0
    });

    // Validate required fields
    if (!reqData.productId) {
      console.error("Product ID is missing in request data");
      throw new Error("Product ID is required");
    }

    if (!reqData.review) {
      console.error("Review text is missing in request data");
      throw new Error("Review text is required");
    }

    // Parse productId and rating
    const productId = parseInt(reqData.productId, 10);
    const rating = reqData.rating ? parseFloat(reqData.rating) : null;

    // Validate product exists
    const product = await productService.findProductById(productId);
    if (!product) {
      console.error("Product not found for ID:", productId);
      throw new Error("Product not found with id " + productId);
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Save images if provided
      let savedImagePaths = [];
      if (reqData.images && reqData.images.length > 0) {
        savedImagePaths = await saveReviewImages(reqData.images);
      }

      // Check if user has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          productId: product.id,
          userId: user.id
        }
      });

      let review;
      if (existingReview) {
        console.log("Updating existing review:", existingReview.id);
        // Update existing review
        review = await prisma.review.update({
          where: {
            id: existingReview.id
          },
          data: {
            review: reqData.review,
            images: savedImagePaths.length > 0 ? savedImagePaths : undefined
          }
        });
      } else {
        console.log("Creating new review");
        // Create new review
        review = await prisma.review.create({
          data: {
            userId: user.id,
            productId: product.id,
            review: reqData.review,
            images: savedImagePaths,
            createdAt: new Date()
          }
        });
      }

      // Handle rating
      if (rating !== null) {
        if (rating < 0 || rating > 5) {
          throw new Error("Rating must be between 0 and 5");
        }

        const existingRating = await prisma.rating.findFirst({
          where: {
            productId: product.id,
            userId: user.id
          }
        });

        if (existingRating) {
          await prisma.rating.update({
            where: {
              id: existingRating.id
            },
            data: {
              rating: rating
            }
          });
        } else {
          await prisma.rating.create({
            data: {
              userId: user.id,
              productId: product.id,
              rating: rating,
              createdAt: new Date()
            }
          });
        }
      }

      // Return review with rating
      return {
        ...review,
        rating: rating
      };
    });

    console.log("Created/updated review with rating:", result);
    return result;
  } catch (error) {
    console.error("Error in createReview service:", error);
    throw error;
  }
}

/**
 * Get all reviews for a specific product
 * @param {Number} productId - The product ID
 * @returns {Array} - The list of reviews for the product
 */
async function getAllReview(productId) {
  try {
    console.log("Getting reviews for product:", productId);
    
    if (!productId) {
      console.error("Product ID is required");
      throw new Error("Product ID is required");
    }

    const parsedId = parseInt(productId, 10);
    if (isNaN(parsedId)) {
      console.error("Invalid product ID:", productId);
      throw new Error("Invalid product ID");
    }

    // First get all reviews
    const reviews = await prisma.review.findMany({
      where: { productId: parsedId },
      include: { 
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all ratings for this product
    const ratings = await prisma.rating.findMany({
      where: { productId: parsedId }
    });

    // Create a map of userId to rating
    const userRatings = new Map(
      ratings.map(rating => [rating.userId, rating.rating])
    );

    // Transform review images to full URLs and add ratings
    const reviewsWithImageUrls = reviews.map(review => ({
      ...review,
      images: review.images.map(image => `/images/reviews/${image}`),
      rating: userRatings.get(review.userId) || 0 // Add the user's rating
    }));

    console.log("Found reviews with ratings:", reviewsWithImageUrls);
    return reviewsWithImageUrls;
  } catch (error) {
    console.error("Error in getAllReview service:", error);
    throw error;
  }
}

module.exports = {
  createReview,
  getAllReview
};