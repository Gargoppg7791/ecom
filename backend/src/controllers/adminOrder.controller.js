const orderService = require("../services/order.service");

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching orders: ", error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const confirmedOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.confirmedOrder(orderId);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error confirming order: ", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const shipOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.shipOrder(orderId);
    return res.status(200).send(order);
  } catch (error) {
    console.error("Error shipping order: ", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.deliveredOrder(orderId);
    return res.status(200).send(order);
  } catch (error) {
    console.error("Error delivering order: ", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.cancelledOrder(orderId);
    return res.status(200).send(order);
  } catch (error) {
    console.error("Error cancelling order: ", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await orderService.deleteOrder(orderId);
    res.status(200).json({ message: "Order Deleted Successfully", success: true });
  } catch (error) {
    console.error("Error deleting order: ", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  getAllOrders,
  confirmedOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
  deleteOrder,
};