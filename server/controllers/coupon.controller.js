const couponModel = require("../models/coupon.model");

const checkCoupon = async (req, res) => {
  const { couponCode } = req.body;
  try {
    const coupon = await couponModel.findOne({ couponCode });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    return res.status(200).json({ coupon });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while checking coupon" });
  }
};

module.exports = checkCoupon;
