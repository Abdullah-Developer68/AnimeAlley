const orderModel = require("../models/order.model.js");
const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");
const couponModel = require("../models/coupon.model.js");
const Reservation = require("../models/reservation.model.js");

const placeOrder = async (req, res) => {
  try {
    const {
      cartItems, // not used for order, reservation is source of truth
      couponCode,
      subtotal,
      discountedPrice,
      SHIPPING_COST,
      finalCost,
      userInfo,
      deliveryAddress,
      paymentMethod,
      cartId,
    } = req.body;

    if (!cartId) {
      return res
        .status(400)
        .json({ success: false, message: "cartId is required" });
    }

    // Validate essential order information
    if (!userInfo?.email || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "User information, delivery address and payment method are required",
      });
    }

    // Verify user exists in database
    const user = await userModel.findOne({ email: userInfo.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If a coupon is provided, check if the user has already used it
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await couponModel.findOne({ couponCode });
      if (!couponDoc) {
        return res.status(400).json({
          success: false,
          message: "Coupon not found.",
        });
      }
      if (user.couponCodeUsed.includes(couponDoc._id)) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon.",
        });
      }
    }

    // Fetch reservation for this cartId
    const reservation = await Reservation.findOne({ cartId });
    if (
      !reservation ||
      !reservation.products ||
      reservation.products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No reserved products found for this cart.",
      });
    }

    // Prepare order items array from reservation
    const productsArray = reservation.products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: null, // will populate below
      selectedVariant: item.variant,
    }));

    // Populate price for each product (for order record)
    for (let item of productsArray) {
      const product = await productModel.findById(item.productId);
      item.price = product ? product.price : 0;
    }

    // Calculate final discount amount
    const discount =
      subtotal && discountedPrice ? subtotal - discountedPrice : 0;

    // Prepare order data object
    const orderData = {
      orderID: "ORD" + Date.now() + Math.floor(Math.random() * 1000),
      products: productsArray,
      user: user._id,
      shippingAddress: deliveryAddress,
      paymentMethod,
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(SHIPPING_COST) || 0,
      discount: Number(discount) || 0,
      finalAmount: Number(finalCost) || 0,
      couponCode,
    };

    // Create new order in database
    const newOrder = await orderModel.create(orderData);

    // If a coupon was used, update its stats
    if (couponCode && discount > 0) {
      await couponModel.findOneAndUpdate(
        { couponCode },
        {
          $inc: {
            totalUsage: 1,
            lifeTimeDiscount: discount,
          },
        }
      );
      if (couponDoc && !user.couponCodeUsed.includes(couponDoc._id)) {
        await userModel.findByIdAndUpdate(user._id, {
          $addToSet: { couponCodeUsed: couponDoc._id },
        });
      }
    }

    // Add order reference to user's orders array
    await userModel.findByIdAndUpdate(user._id, {
      $push: { orders: newOrder._id },
    });

    // Delete reservation after order is placed
    await Reservation.deleteOne({ cartId });

    // Get populated order details for response
    const populatedOrder = await orderModel
      .findById(newOrder._id)
      .populate("products.productId")
      .populate("user", "email username");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getOrderHistory = async (req, res) => {
  const { email, currPage } = req.query;

  // Validate user email and current page
  if (!email || !currPage) {
    return res.status(400).json({
      success: false,
      message: "User email and current page are required",
    });
  }

  try {
    // Verify user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ordersPerPage = 2;
    const page = parseInt(currPage, 10) || 1;
    const startIndex = (page - 1) * ordersPerPage;

    // Get the total count of orders for this specific user
    const totalOrders = await orderModel.countDocuments({ user: user._id });

    if (totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this user",
        paginatedOrders: [],
        totalPages: 0,
        totalOrders: 0,
      });
    }

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    // Fetch and populate orders with product and user details using pagination
    const paginatedOrders = await orderModel
      .find({ user: user._id })
      .populate({
        path: "products.productId",
        select: "name price image description",
      })
      .populate({ path: "user", select: "email username" })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(ordersPerPage);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      paginatedOrders,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const allOrdersList = async (req, res) => {
  const { email, currPage } = req.query;

  if (!email || !currPage) {
    return res
      .status(400)
      .json({ message: "Email and current page are required!" });
  }
  const user = await userModel.findOne({ email });
  // Check if user exists and is either admin or superAdmin
  if (!user || (user.role !== "admin" && user.role !== "superAdmin")) {
    return res.status(403).json("User is not authorized!");
  }

  const ordersPerPage = 20;
  // Parse the current page number, default to 1 if invalid
  const page = parseInt(currPage, 10) || 1;

  const startIndex = (page - 1) * ordersPerPage;

  try {
    const totalOrders = await orderModel.countDocuments();

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    // Fetch only the orders for the current page using skip and limit
    const currPageOrders = await orderModel
      .find()
      .sort({ createdAt: -1 }) // Sort orders by creation date, newest first
      .skip(startIndex) // Skip orders from previous pages
      .limit(ordersPerPage) // Limit to ordersPerPage results
      .populate({
        path: "products.productId",
        select: "name price image description",
      })
      .populate({ path: "user", select: "email username" });

    // Respond with paginated orders and pagination info
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      currPageOrders, // Orders for the current page
      totalOrders, // Total number of orders (for frontend pagination)
      totalPages,
    });
  } catch (error) {
    // Handle and log any errors
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    const result = await orderModel.findByIdAndDelete(orderId);

    if (!result) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Optional: You might want to remove the order reference from the user's order history as well.
    // await userModel.updateMany({}, { $pull: { orders: orderId } });

    res.status(200).json({
      success: true,
      message: `Order with ID: ${orderId} has been deleted.`,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

// Controller to get order stats by status
const getOrderStats = async (req, res) => {
  try {
    const stats = await orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const result = {};
    stats.forEach((s) => {
      result[s._id] = s.count;
    });
    res.json({ success: true, stats: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  placeOrder,
  getOrderHistory,
  allOrdersList,
  deleteOrder,
  updateOrder,
  getOrderStats,
};
