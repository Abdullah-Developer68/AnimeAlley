const express = require("express");
const router = express.Router();
const checkCoupon = require("../controllers/coupon.controller");

router.post("/verify", checkCoupon);

module.exports = router;
