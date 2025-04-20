const cartItemService = require("../services/cartItem.service.js");

/**
 * Update a cart item
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function updateCartItem(req, res) {
  const user = req.user;

  try {
    const updatedCartItem = await cartItemService.updateCartItem(user.id, parseInt(req.params.id), req.body);
    return res.status(200).send(updatedCartItem);
  } catch (err) {
    console.error("Error updating cart item:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Remove a cart item
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function removeCartItem(req, res) {
  const user = req.user;

  console.log(user.id, "userId");

  try {
    await cartItemService.removeCartItem(user.id, parseInt(req.params.id));
    return res.status(200).send({ message: "Item removed", status: true });
  } catch (err) {
    console.error("Error removing cart item:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { updateCartItem, removeCartItem };