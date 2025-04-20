const express = require("express");
const router = express.Router();

const cartService = require("../services/cart.service.js");

/**
 * Find a user's cart and send the response
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const findUserCart = async (req, res) => {
  try {
    console.log("Finding user cart - Request headers:", req.headers);
    console.log("Finding user cart - User:", req.user);

    const user = req.user;
    if (!user || !user.id) {
      console.log("User not authenticated or missing ID");
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // Ensure user.id is a valid number
    const userId = Number(user.id);
    if (isNaN(userId)) {
      console.log("Invalid user ID format:", user.id);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    console.log("Finding cart for user ID:", userId);
    const cart = await cartService.findUserCart(userId);
    
    // Log the cart data for debugging
    console.log("Cart data:", JSON.stringify(cart, null, 2));

    // Handle cases where cart is null or undefined
    if (!cart) {
      console.log("No cart found for user");
      return res.status(200).json({
        success: true,
        data: {
          cartItems: [],
          totalItem: 0,
          totalPrice: 0,
          totalDiscountedPrice: 0,
          discount: 0
        },
        message: "Cart is empty"
      });
    }

    // Ensure cartItems exists and is an array
    const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

    // Format the cart items to include only necessary data
    const formattedCartItems = cartItems.map(item => {
      if (!item) return null;
      
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity || 0,
        price: item.price || 0,
        discountedPrice: item.discountedPrice || 0,
        size: item.size,
        color: item.color,
        product: item.product ? {
          id: item.product.id,
          title: item.product.title,
          description: item.product.description,
          price: item.product.price || 0,
          discountedPrice: item.product.discountedPrice || 0,
          discountPercent: item.product.discountPercent || 0,
          brand: item.product.brand,
          color: item.product.color,
          photos: item.product.photos || []
        } : null
      };
    }).filter(item => item !== null);

    // Calculate totals if not provided
    const totalItem = formattedCartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = formattedCartItems.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
    const totalDiscountedPrice = formattedCartItems.reduce((sum, item) => sum + (item.discountedPrice * item.quantity || 0), 0);
    const discount = totalPrice - totalDiscountedPrice;

    return res.status(200).json({
      success: true,
      data: {
        cartItems: formattedCartItems,
        totalItem: cart.totalItem || totalItem,
        totalPrice: cart.totalPrice || totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice || totalDiscountedPrice,
        discount: cart.discount || discount
      },
      message: "Cart retrieved successfully"
    });
  } catch (error) {
    console.error("Error finding user cart - Full error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      success: false,
      message: "Failed to get user cart",
      error: error.message 
    });
  }
};

/**
 * Add an item to the user's cart and send the response
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const addItemToCart = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    if (!req.body.productId) {
      return res.status(400).json({ 
        success: false,
        message: "Product ID is required" 
      });
    }

    if (!req.body.quantity || req.body.quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be at least 1" 
      });
    }

    const updatedCart = await cartService.addCartItem(user.id, req.body);
    
    return res.status(200).json({ 
      success: true,
      data: updatedCart,
      message: "Item Added To Cart Successfully" 
    });
  } catch (error) {
    console.error("Error adding item to cart: ", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to add item to cart",
      error: error.message 
    });
  }
};

module.exports = { findUserCart, addItemToCart };