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
  } = session.metadata;
  // Find the reservation
  const reservation = await reservationModel
    .findOne({ cartId })
    .populate("products.productId");

  if (!reservation) {
    throw new Error(`No reservation found for cart: ${cartId}`);
  }

  // Extract user email for user identification
  const userEmail =
    session.customer_details?.email || session.metadata.userEmail;

  // Find the user to get their ID (required for Order model)
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
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
  console.log("shippingAddress to be saved:", shippingAddress);
  // Create the order
  const order = new orderModel(orderData);
  await order.save();

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
            orders: order._id,
          },
        });
      } else {
        // Just add the order if coupon already used
        await userModel.findByIdAndUpdate(user._id, {
          $push: { orders: order._id },
        });
      }
    }
  } else {
    // No coupon used, just add order to user
    await userModel.findByIdAndUpdate(user._id, {
      $push: { orders: order._id },
    });
  }

  // Delete reservation after successful order creation
  await reservationModel.deleteOne({ cartId });

  console.log(
    `Order ${orderData.orderID} created successfully from cart ${cartId}`
  );
};

const handleStripeWebhook = async (req, res) => {
  dbConnect();
  console.log("Stripe webhook received!");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature for security
    event = stripe.webhooks.constructEvent(req.body, sig, webHookSecretKey);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await processSuccessfulPayment(session);
      console.log("Stripe session metadata:", session.metadata);
      console.log(`Payment completed successfully for cart: ${cartId}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      return res.status(500).json({ error: "Payment processing failed" });
    }
  }

  // Handle failed payments
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const { cartId } = session.metadata;

    console.log(`Payment session expired for cart: ${cartId}`);
  }

  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook,
};
