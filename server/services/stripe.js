const Stripe = require("stripe");
const dotenv = require("dotenv");
const reservationModel = require("../models/reservation.model.js");
const couponModel = require("../models/coupon.model.js");
dotenv.config();

// Initialized Stripe instance for backends
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const {
    cartId,
    couponCode,
    userEmail,
    originalTotal,
    finalTotal,
    discountAmount,
    deliveryAddress,
    SHIPPING_COST,
  } = req.body;

  try {
    // Find reservation by cartId field, not by _id
    const reservation = await reservationModel
      .findOne({ cartId })
      .populate("products.productId");

    if (
      !reservation ||
      !reservation.products ||
      reservation.products.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "No reservations found for this cart" });
    }

    // Create line items using the FINAL discounted prices
    // Calculate per-item discount ratio
    const calculatedSubtotal = reservation.products.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const discountRatio = finalTotal / calculatedSubtotal;

    const lineItems = reservation.products.map((item) => {
      const itemOriginalPrice = item.productId.price;
      const itemDiscountedPrice = itemOriginalPrice * discountRatio;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productId.name,
            images: [`${item.productId.image}`],
          },
          unit_amount: Math.round(itemDiscountedPrice * 100), // Use discounted price
        },
        quantity: item.quantity,
      };
    });

    // Get coupon info for display (if provided)
    let appliedCoupon = null;
    if (couponCode && userEmail) {
      appliedCoupon = await couponModel.findOne({ couponCode });
    }

    // Create checkout session configuration
    const sessionConfig = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        cartId: cartId,
        couponCode: couponCode || "",
        userEmail: userEmail || "",
        discountAmount: discountAmount || "0",
        originalTotal: originalTotal || calculatedSubtotal.toFixed(2),
        finalTotal: finalTotal || calculatedSubtotal.toFixed(2),
        shippingAddress: deliveryAddress || "",
        SHIPPING_COST: SHIPPING_COST || 5,
      },
    };

    // DO NOT add Stripe discounts - prices are already discounted
    // The discount was applied in cart.jsx before reaching this point

    // Create a new Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      sessionId: session.id,
      subtotal: originalTotal || calculatedSubtotal.toFixed(2),
      discountAmount: discountAmount || "0",
      finalTotal: finalTotal || calculatedSubtotal.toFixed(2),
      couponApplied: appliedCoupon ? appliedCoupon.couponCode : null,
    });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCheckoutSession,
};
