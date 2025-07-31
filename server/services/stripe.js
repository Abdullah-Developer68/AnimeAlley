const Stripe = require("stripe");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const reservationModel = require("../models/reservation.model.js");
const dbConnect = require("../config/dbConnect.js");
const couponModel = require("../models/coupon.model.js");
dotenv.config();

// Initialized Stripe instance for backends
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  await dbConnect();

  // Extract user email from JWT token (authentication required)
  let authenticatedUserEmail;

  try {
    // First, try to get token from Authorization header (localStorage method)
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie-based token
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required for checkout",
      });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    authenticatedUserEmail = decoded.email;

    if (!authenticatedUserEmail) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token - no email found",
      });
    }

    console.log(`🔐 Authenticated user email: ${authenticatedUserEmail}`);
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }

  const { paymentData } = req.body;
  const { cartId, couponCode, deliveryAddress } = paymentData;
  const shippingCost = 5;
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
      (sum, currItem) => sum + currItem.productId.price * currItem.quantity,
      0
    );
    let coupon;
    let discountAmount;
    if (couponCode.length > 0) {
      // find the coupon used
      coupon = await couponModel.findOne({ couponCode });

      if (!coupon) {
        // do not proceed further because we do not want to procced with the payment if coupon was not applied
        return res.status(400).json({ error: "Coupon not found" });
      }
      // calculate the discount
      discountAmount = Math.round(
        calculatedSubtotal * (coupon.discountPercentage / 100)
      );
    } else {
      discountAmount = 0;
    }

    // calculate final Total
    const finalTotal = calculatedSubtotal + shippingCost - discountAmount;
    // calculate the discount ratio
    const discountRatio = finalTotal / calculatedSubtotal;
    // calculate the discounted price for each item
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
    if (couponCode && authenticatedUserEmail) {
      appliedCoupon = await couponModel.findOne({ couponCode });
    }

    // Create checkout session configuration with locked email
    const sessionConfig = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,

      // Lock the customer email to the authenticated user's email
      customer_creation: "always",
      customer_email: authenticatedUserEmail,

      metadata: {
        cartId: cartId,
        couponCode: couponCode || "",
        userEmail: authenticatedUserEmail, // Use authenticated email
        discountAmount: discountAmount || "0",
        originalTotal: calculatedSubtotal.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        shippingAddress: deliveryAddress || "",
        shippingCost: shippingCost || 5,
      },
    };

    // DO NOT add Stripe discounts - prices are already discounted
    // The discount was applied in cart.jsx before reaching this point

    // Create a new Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      sessionId: session.id,
      subtotal: calculatedSubtotal.toFixed(2),
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
