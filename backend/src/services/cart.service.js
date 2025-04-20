const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Create a new cart for a user
 * @param {Number} userId - The user ID to create a cart for
 * @returns {Object} - The created cart
 */
async function createCart(userId) {
  try {
    const cart = await prisma.cart.create({
      data: {
        userId: userId, // Pass only the userId here
      },
    });
    return cart;
  } catch (error) {
    throw new Error("Failed to create cart: " + error.message);
  }
}

/**
 * Find a user's cart and update cart details
 * @param {Number} userId - The user ID to find the cart for
 * @returns {Object} - The found and updated cart
 */
async function findUserCart(userId) {
  try {
    console.log("findUserCart - Starting with userId:", userId);

    if (!userId) {
      console.log("findUserCart - No userId provided");
      throw new Error("User ID is required");
    }

    // Ensure userId is a number
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      console.log("findUserCart - Invalid userId format:", userId);
      throw new Error("Invalid user ID format");
    }

    console.log("findUserCart - Looking for cart with userId:", numericUserId);
    let cart;
    try {
      // First, check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: numericUserId }
      });

      if (!user) {
        console.error("findUserCart - User not found:", numericUserId);
        throw new Error("User not found");
      }

      // Then try to find their cart
      cart = await prisma.cart.findUnique({
        where: { userId: numericUserId },
        include: { 
          cartItems: { 
            include: { 
              product: {
                include: {
                  color: true,
                }
              } 
            } 
          } 
        },
      });
      console.log("findUserCart - Found cart:", JSON.stringify(cart, null, 2));
    } catch (error) {
      console.error("findUserCart - Database error:", error);
      throw new Error("Database error: " + error.message);
    }

    if (!cart) {
      console.log("findUserCart - No cart found, creating new cart");
      try {
        cart = await prisma.cart.create({
          data: {
            userId: numericUserId,
            totalPrice: 0,
            totalItem: 0,
            totalDiscountedPrice: 0,
            discount: 0
          },
          include: { 
            cartItems: { 
              include: { 
                product: {
                  include: {
                    color: true,
                  }
                } 
              } 
            } 
          },
        });
        console.log("findUserCart - Created new cart:", JSON.stringify(cart, null, 2));
      } catch (error) {
        console.error("findUserCart - Error creating cart:", error);
        // If cart creation fails due to unique constraint, try to fetch it again
        try {
          cart = await prisma.cart.findUnique({
            where: { userId: numericUserId },
            include: { 
              cartItems: { 
                include: { 
                  product: {
                    include: {
                      color: true,
                    }
                  } 
                } 
              } 
            },
          });
          if (!cart) {
            console.error("findUserCart - Failed to find cart after creation failure");
            throw new Error("Failed to create or find cart");
          }
          console.log("findUserCart - Found existing cart after creation failure:", JSON.stringify(cart, null, 2));
        } catch (fetchError) {
          console.error("findUserCart - Error fetching cart after creation failure:", fetchError);
          throw new Error("Failed to create or find cart: " + error.message);
        }
      }
    }

    // Initialize totals
    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    // Only calculate totals if there are cart items
    if (cart.cartItems && cart.cartItems.length > 0) {
      console.log("findUserCart - Calculating totals for cart items:", JSON.stringify(cart.cartItems, null, 2));
      for (const cartItem of cart.cartItems) {
        if (!cartItem.quantity || !cartItem.product) {
          console.warn("findUserCart - Invalid cart item data:", cartItem);
          continue;
        }
        // Calculate using original product prices
        totalPrice += cartItem.product.price * cartItem.quantity;
        totalDiscountedPrice += cartItem.product.discountedPrice * cartItem.quantity;
        totalItem += cartItem.quantity;
      }
    }

    console.log("findUserCart - Calculated totals:", { totalPrice, totalDiscountedPrice, totalItem });

    // Only update the cart if there are changes and the cart exists
    if (cart && (cart.totalPrice !== totalPrice || 
        cart.totalDiscountedPrice !== totalDiscountedPrice || 
        cart.totalItem !== totalItem)) {
      try {
        cart = await prisma.cart.update({
          where: { userId: numericUserId },
          data: {
            totalPrice,
            totalItem,
            totalDiscountedPrice,
            discount: totalPrice - totalDiscountedPrice,
          },
          include: { 
            cartItems: { 
              include: { 
                product: {
                  include: {
                    color: true,
                  }
                } 
              } 
            } 
          },
        });
        console.log("findUserCart - Updated cart with new totals:", JSON.stringify(cart, null, 2));
      } catch (error) {
        console.error("findUserCart - Error updating cart totals:", error);
        // If update fails, return the cart with calculated totals
        cart.totalPrice = totalPrice;
        cart.totalDiscountedPrice = totalDiscountedPrice;
        cart.totalItem = totalItem;
        cart.discount = totalPrice - totalDiscountedPrice;
      }
    } else {
      console.log("findUserCart - No updates needed for cart totals");
    }

    return cart;
  } catch (error) {
    console.error("findUserCart - Error details:", error);
    console.error("findUserCart - Error stack:", error.stack);
    throw new Error("Failed to find user cart: " + error.message);
  }
}

/**
 * Add an item to the user's cart
 * @param {Number} userId - The user ID to add the item to the cart for
 * @param {Object} req - The request object containing productId, size, and quantity
 * @returns {String} - A message indicating the item was added
 */
async function addCartItem(userId, req) {
  try {
    console.log("Adding item to cart:", { userId, req });

    let cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { cartItems: true }
    });

    if (!cart) {
      console.log("No cart found, creating new cart");
      cart = await createCart(userId);
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.productId) },
    });

    if (!product) {
      throw new Error("Product not found: " + req.productId);
    }

    console.log("Found product:", product);

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { 
        cartId: cart.id, 
        productId: product.id, 
        userId: userId,
        size: req.size?.name,
        color: req.color?.name
      },
    });

    if (existingCartItem) {
      console.log("Updating existing cart item:", existingCartItem);
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + (req.quantity || 1),
          price: product.price, // Store original price
          discountedPrice: product.discountedPrice // Store original discounted price
        },
      });
    } else {
      console.log("Creating new cart item");
      await prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: product.id } },
          user: { connect: { id: userId } },
          quantity: req.quantity || 1,
          size: req.size?.name || 'default',
          color: req.color?.name || 'default',
          price: product.price, // Store original price
          discountedPrice: product.discountedPrice // Store original discounted price
        },
      });
    }

    // Fetch the updated cart to return
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { 
        cartItems: { 
          include: { 
            product: {
              include: {
                color: true,
              }
            } 
          } 
        } 
      },
    });

    console.log("Updated cart:", updatedCart);
    return updatedCart;
  } catch (error) {
    console.error("Error adding item to cart: ", error.message);
    throw new Error("Failed to add item to cart: " + error.message);
  }
}

module.exports = { createCart, findUserCart, addCartItem };