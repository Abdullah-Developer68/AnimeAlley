const Stripe = require("stripe");
const dotenv = require("dotenv");
const reservationModel = require("../models/reservation.model.js");
const orderModel = require("../models/order.model.js");
const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");
const couponModel = require("../models/coupon.model.js");
dotenv.config();
const dbConnect = require("../config/dbConnect.js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const webHookSecretKey = process.env.STRIPE_WEBHOOK_SECRET;

const processSuccessfulPayment = async (session) => {
  dbConnect();

  const {
    cartId,
    couponCode,
    originalTotal,
    finalTotal,
    discountAmount,
    shippingAddress, // <-- fix: use shippingAddress
    SHIPPING_COST,
    userEmail: metadataUserEmail,
  } = session.metadata;

  // Find the reservation
  const reservation = await reservationModel
    .findOne({ cartId })
    .populate("products.productId");

  if (!reservation) {
    console.error(`No reservation found for cart: ${cartId}`);
    throw new Error(`No reservation found for cart: ${cartId}`);
  }

  // Extract user email for user identification
  const userEmail = session.customer_details?.email || metadataUserEmail;

  // Find the user to get their ID (required for Order model)
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    console.error(`No user found with email: ${userEmail}`);
    throw new Error(`No user found with email: ${userEmail}`);
  }

  // Create order from reservation data matching your Order model structure
  const orderData = {
    orderID: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    products: reservation.products.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    })),
    user: user._id, // Required field in your Order model
    shippingAddress, // <-- fix: use shippingAddress
    paymentMethod: "stripe",
    subtotal: parseFloat(originalTotal),
    shippingCost: parseFloat(SHIPPING_COST) || 0,
    discount: parseFloat(discountAmount) || 0,
    finalAmount: parseFloat(finalTotal),
    couponCode: couponCode || null,
    status: "processing", // Using your enum values
    orderDate: new Date(),
  };

  // Create the order
  const order = new orderModel(orderData);
  const savedOrder = await order.save();

  // Handle coupon usage if coupon was used
  if (couponCode) {
    const coupon = await couponModel.findOne({ couponCode });
    if (coupon) {
      // Update coupon statistics
      await couponModel.findByIdAndUpdate(coupon._id, {
        $inc: {
          totalUsage: 1,
          lifeTimeDiscount: discountAmount,
        },
      });

      // Add coupon to user's used coupons array (prevent reuse)
      if (!user.couponCodeUsed.includes(coupon._id)) {
        await userModel.findByIdAndUpdate(user._id, {
          $push: {
            couponCodeUsed: coupon._id,
            orders: savedOrder._id,
          },
        });
      } else {
        // Just add the order if coupon already used
        await userModel.findByIdAndUpdate(user._id, {
          $push: { orders: savedOrder._id },
        });
      }
    }
  } else {
    // No coupon used, just add order to user
    await userModel.findByIdAndUpdate(user._id, {
      $push: { orders: savedOrder._id },
    });
  }

  // Delete reservation after successful order creation
  await reservationModel.deleteOne({ cartId });
};

const handleStripeWebhook = async (req, res) => {
  dbConnect();
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature for security
    event = stripe.webhooks.constructEvent(req.body, sig, webHookSecretKey);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await processSuccessfulPayment(session);
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({ error: "Payment processing failed" });
    }
  }

  // Handle failed payments
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const { cartId } = session.metadata;
  }

  // Log other webhook events for debugging
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.expired"
  ) {
  }

  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook,
};
