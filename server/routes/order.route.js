const express = require("express");
const router = express.Router();
const { placeOrder } = require("../controllers/order.controller.js");

router.post("/placeOrder", placeOrder);

module.exports = router;
