const orderModel = require("../models/order.model.js");
const userModel = require("../models/user.model.js");
const productModel = require("../models/product.model.js");

const placeOrder = async (req, res) => {
  try {
    const {
      cartItems,
      couponCode,
      subtotal,
      discountedPrice,
      SHIPPING_COST,
      finalCost,
      userInfo,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    // Add validation for cartItems
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required and must be an array",
      });
    }

    // Debug logs
    console.log("Cart Items:", JSON.stringify(cartItems, null, 2));
    console.log("Pricing:", { subtotal, discountedPrice, finalCost });

    if (!userInfo?.email || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "User information, delivery address and payment method are required",
      });
    }

    const user = await userModel.findOne({ email: userInfo.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const orderID = "ORD" + Date.now() + Math.floor(Math.random() * 1000);

    // Modified to use itemQuantity instead of quantity
    const productsArray = await Promise.all(
      cartItems.map(async (item) => {
        const productId = item._id;

        if (!productId) {
          throw new Error(`Invalid product in cart: ${JSON.stringify(item)}`);
        }

        const product = await productModel.findById(productId);
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.stock < item.itemQuantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        return {
          productId: productId,
          quantity: item.itemQuantity, // Changed from quantity to itemQuantity
          price: product.price,
        };
      })
    );

    // Calculate discount safely
    const discount =
      subtotal && discountedPrice ? subtotal - discountedPrice : 0;

    // Create order with validated data
    const orderData = {
      orderID,
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

    const newOrder = await orderModel.create(orderData);

    // Update product stock and sold count
    await Promise.all(
      productsArray.map(async (item) => {
        await productModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: -item.quantity,
              sold: item.quantity, // Increment sold count
            },
          },
          { new: true } // Return updated document
        );
      })
    );

    // Update user's orders
    await userModel.findByIdAndUpdate(user._id, {
      $push: { orders: newOrder._id },
    });

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

module.exports = {
  placeOrder,
};
