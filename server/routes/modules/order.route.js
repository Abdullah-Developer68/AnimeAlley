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

router.post("/placeOrder", placeOrder);

router.get("/getOrders", getOrderHistory);
router.get("/allOrdersList", allOrdersList);
router.delete("/delete/:orderId", deleteOrder);
router.put("/update/:orderId", updateOrder);
router.get("/orderStats", getOrderStats);

module.exports = router;
