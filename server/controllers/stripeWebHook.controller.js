const Stripe = require("stripe");
const dotenv = require("dotenv");
const reservationModel = require("../models/reservation.model.js");
const orderModel = require("../models/order.model.js");
const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");
const couponModel = require("../models/coupon.model.js");
const mongoose = require("mongoose");
const dbConnect = require("../config/dbConnect.js");
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const webHookSecretKey = process.env.STRIPE_WEBHOOK_SECRET;

const processSuccessfulPayment = async (session) => {
  dbConnect();
  // Start a MongoDB session for transaction
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const {
      cartId,
      couponCode,
      originalTotal,
      finalTotal,
      discountAmount,
      shippingAddress,
      SHIPPING_COST,
      userEmail: metadataUserEmail,
    } = session.metadata;

    // Find the reservation within transaction
    const reservation = await reservationModel
      .findOne({ cartId })
      .populate("products.productId")
      .session(mongoSession);

    if (!reservation) {
      await mongoSession.abortTransaction();
      console.error(`No reservation found for cart: ${cartId}`);
      throw new Error(`No reservation found for cart: ${cartId}`);
    }

    // Extract user email for user identification
    const finalUserEmail = session.customer_details?.email || metadataUserEmail;

    // Find the user to get their ID (required for Order model)
    const user = await userModel
      .findOne({ email: finalUserEmail })
      .session(mongoSession);
    if (!user) {
      await mongoSession.abortTransaction();
      console.error(`No user found with email: ${finalUserEmail}`);
      throw new Error(`No user found with email: ${finalUserEmail}`);
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
      shippingAddress: shippingAddress,
      paymentMethod: "stripe",
      subtotal: parseFloat(originalTotal),
      shippingCost: parseFloat(SHIPPING_COST) || 0,
      discount: parseFloat(discountAmount) || 0,
      finalAmount: parseFloat(finalTotal),
      couponCode: couponCode || null,
      status: "processing", // Using your enum values
      orderDate: new Date(),
    };

    // Create the order within transaction
    const order = new orderModel(orderData);
    const savedOrder = await order.save({ session: mongoSession });

    // Handle coupon usage if coupon was used
    if (couponCode) {
      const coupon = await couponModel
        .findOne({ couponCode: couponCode })
        .session(mongoSession);

      if (coupon) {
        // Update coupon statistics within transaction
        await couponModel.findByIdAndUpdate(
          coupon._id,
          {
            $inc: {
              totalUsage: 1,
              lifeTimeDiscount: parseFloat(discountAmount),
            },
          },
          { session: mongoSession }
        );

        // Add coupon to user's used coupons array (prevent reuse)
        if (!user.couponCodeUsed.includes(coupon._id)) {
          await userModel.findByIdAndUpdate(
            user._id,
            {
              $push: {
                couponCodeUsed: coupon._id,
                orders: savedOrder._id,
              },
            },
            { session: mongoSession }
          );
        } else {
          // Just add the order if coupon already used
          await userModel.findByIdAndUpdate(
            user._id,
            {
              $push: { orders: savedOrder._id },
            },
            { session: mongoSession }
          );
        }
      } else {
        console.error(`Coupon not found: ${couponCode}`);
        // Still add order to user even if coupon not found
        await userModel.findByIdAndUpdate(
          user._id,
          {
            $push: { orders: savedOrder._id },
          },
          { session: mongoSession }
        );
      }
    } else {
      // No coupon used, just add order to user
      await userModel.findByIdAndUpdate(
        user._id,
        {
          $push: { orders: savedOrder._id },
        },
        { session: mongoSession }
      );
    }

    // Delete reservation after successful order creation (within transaction)
    await reservationModel.deleteOne({ cartId }, { session: mongoSession });

    // Commit transaction
    await mongoSession.commitTransaction();
    console.log(`✅ Order created successfully for cart: ${cartId}`);
  } catch (error) {
    // Rollback transaction on any error
    await mongoSession.abortTransaction();
    console.error(
      "❌ CRITICAL: Payment succeeded but order creation failed:",
      error
    );
    throw error;
  } finally {
    mongoSession.endSession();
  }
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
    console.log(`Payment session expired for cart: ${cartId}`);
    // Note: Reservation cleanup will happen via the cleanup utility
  }

  // Log other webhook events for debugging
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.expired"
  ) {
    console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook,
};
