const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrderHistory,
  allOrdersList,
  deleteOrder,
  updateOrder,
  getOrderStats,
} = require("../../controllers/order.controller.js");

// POST
router.post("/placeOrder", placeOrder);
// GET
router.get("/getOrders", getOrderHistory);
router.get("/allOrdersList", allOrdersList);
router.get("/orderStats", getOrderStats);
// DELETE
router.delete("/delete/:orderId", deleteOrder);
// UPDATE
router.put("/update/:orderId", updateOrder);

module.exports = router;
