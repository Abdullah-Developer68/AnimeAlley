const express = require("express");
const router = express.Router();
const {
  checkCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCoupon,
  createCoupon,
  getCouponStats,
} = require("../../controllers/coupon.controller.js");

router.post("/verify", checkCoupon);
router.get("/allCoupons", getAllCoupons);
router.delete("/delete/:couponId", deleteCoupon);

// Route to update a coupon by ID
router.put("/update/:couponId", updateCoupon);

router.post("/createCoupon", createCoupon);

router.get("/stats", getCouponStats);

module.exports = router;
