const { PrismaClient } = require("@prisma/client");
const userService = require("../services/user.service.js");

const prisma = new PrismaClient();

/**
 * Update an existing cart item
 * @param {Number} userId - The user ID
 * @param {Number} cartItemId - The cart item ID
 * @param {Object} cartItemData - The cart item data
 * @returns {Object} - The updated cart item
 */
async function updateCartItem(userId, cartItemId, cartItemData) {
    const item = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true },
    });

    if (!item) {
        throw new Error("Cart item not found: " + cartItemId);
    }

    const user = await userService.findUserById(item.userId);

    if (!user) {
        throw new Error("User not found: " + userId);
    }

    if (user.id === userId) {
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: {
                quantity: cartItemData.quantity,
                price: cartItemData.quantity * item.product.price,
                discountedPrice: cartItemData.quantity * item.product.discountedPrice,
            },
        });
        return updatedCartItem;
    } else {
        throw new Error("You can't update another user's cart item");
    }
}

/**
 * Check if a cart item already exists in the user's cart
 * @param {Number} cartId - The cart ID
 * @param {Number} productId - The product ID
 * @param {String} size - The size of the product
 * @param {Number} userId - The user ID
 * @returns {Object} - The cart item if it exists
 */
async function isCartItemExist(cartId, productId, size, userId) {
    const cartItem = await prisma.cartItem.findFirst({
        where: { cartId: cartId, productId: productId, size: size, userId: userId },
    });
    return cartItem;
}

/**
 * Remove a cart item
 * @param {Number} userId - The user ID
 * @param {Number} cartItemId - The cart item ID
 */
async function removeCartItem(userId, cartItemId) {
    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });

    if (!cartItem) throw new Error("CartItem not found");

    const user = await userService.findUserById(cartItem.userId);
    const reqUser = await userService.findUserById(userId);

    if (user.id === reqUser.id) {
        await prisma.cartItem.delete({
            where: { id: cartItem.id },
        });
    } else {
        throw new Error("You can't remove another user's item");
    }
}

/**
 * Find a cart item by its ID
 * @param {Number} cartItemId - The cart item ID
 * @returns {Object} - The found cart item
 */
async function findCartItemById(cartItemId) {
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true },
    });
    if (cartItem) {
        return cartItem;
    } else {
        throw new Error(`CartItem not found with id: ${cartItemId}`);
    }
}

module.exports = {
    updateCartItem,
    isCartItemExist,
    removeCartItem,
    findCartItemById,
};