// server/controllers/reservation.controller.js
const Reservation = require("../models/reservation.model.js");
const Product = require("../models/product.model.js");
const dbConnect = require("../config/dbConnect.js");
const mongoose = require("mongoose");

const reserveStock = async (req, res) => {
  dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, productId, variant, requestedQuantity } = req.body;
    if (!cartId || !productId || !requestedQuantity) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Find product within transaction
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check available stock
    let availableStock;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      if (!variant) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: "Variant required" });
      }
      availableStock = product.stock[variant] || 0;
    } else {
      availableStock = product.stock || 0;
    }

    if (availableStock === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Out of stock",
      });
    }

    // Determine how much we can actually reserve (partial logic built-in)
    const quantityToReserve = Math.min(requestedQuantity, availableStock);
    const isPartial = quantityToReserve < requestedQuantity;

    // Reserve the available quantity
    let stockQuery, updateQuery;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      stockQuery = {
        _id: productId,
        [`stock.${variant}`]: { $gte: quantityToReserve },
      };
      updateQuery = { $inc: { [`stock.${variant}`]: -quantityToReserve } };
    } else {
      stockQuery = { _id: productId, stock: { $gte: quantityToReserve } };
      updateQuery = { $inc: { stock: -quantityToReserve } };
    }

    // Atomically check and decrement stock
    const updated = await Product.updateOne(stockQuery, updateQuery, {
      session,
    });
    if (updated.modifiedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Stock changed during reservation, please try again",
      });
    }

    // Create or update reservation atomically
    let reservation = await Reservation.findOne({ cartId }).session(session);
    if (!reservation) {
      reservation = await Reservation.create([{ cartId, products: [] }], {
        session,
      });
      reservation = reservation[0];
    }

    // Find if product already reserved
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );

    if (prodIdx !== -1) {
      reservation.products[prodIdx].quantity += quantityToReserve;
    } else {
      reservation.products.push({
        productId,
        variant,
        quantity: quantityToReserve,
      });
    }

    reservation.reservedAt = new Date();
    await reservation.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: isPartial
        ? "Partial quantity reserved"
        : "Stock reserved successfully",
      reservedQuantity: quantityToReserve,
      requestedQuantity: requestedQuantity,
      isPartial: isPartial,
      availableStock: availableStock,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Reserve stock error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const releaseStock = async (req, res) => {
  dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let reservation = await Reservation.findOne({ cartId }).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx === -1) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });
    }

    // Find product to determine stock structure
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Atomically restore stock
    let updateQuery;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      updateQuery = { $inc: { [`stock.${variant}`]: quantity } };
    } else {
      updateQuery = { $inc: { stock: quantity } };
    }

    await Product.updateOne({ _id: productId }, updateQuery, { session });

    // Update or remove product from reservation
    if (reservation.products[prodIdx].quantity > quantity) {
      reservation.products[prodIdx].quantity -= quantity;
    } else {
      reservation.products.splice(prodIdx, 1);
    }

    reservation.reservedAt = new Date();

    if (reservation.products.length === 0) {
      await Reservation.deleteOne({ _id: reservation._id }, { session });
    } else {
      await reservation.save({ session });
    }

    await session.commitTransaction();
    return res.json({ success: true, message: "Stock released successfully" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Release stock error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const decrementReservationStock = async (req, res) => {
  dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let reservation = await Reservation.findOne({ cartId }).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx === -1) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });
    }

    // Find product to determine stock structure
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Atomically restore stock
    let updateQuery;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      updateQuery = { $inc: { [`stock.${variant}`]: quantity } };
    } else {
      updateQuery = { $inc: { stock: quantity } };
    }

    await Product.updateOne({ _id: productId }, updateQuery, { session });

    // Update or remove product from reservation
    if (reservation.products[prodIdx].quantity > quantity) {
      reservation.products[prodIdx].quantity -= quantity;
    } else {
      reservation.products.splice(prodIdx, 1);
    }

    reservation.reservedAt = new Date();

    if (reservation.products.length === 0) {
      await Reservation.deleteOne({ _id: reservation._id }, { session });
    } else {
      await reservation.save({ session });
    }

    await session.commitTransaction();
    return res.json({
      success: true,
      message: "Reservation decremented and stock restored successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Decrement reservation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const incrementReservationStock = async (req, res) => {
  dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, productId, variant } = req.body;
    if (!cartId || !productId) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Find reservation
    let reservation = await Reservation.findOne({ cartId }).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx === -1) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });
    }

    // Find product to check available stock
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if we can reserve 1 more unit
    let stockQuery, updateQuery;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      stockQuery = { _id: productId, [`stock.${variant}`]: { $gte: 1 } };
      updateQuery = { $inc: { [`stock.${variant}`]: -1 } };
    } else {
      stockQuery = { _id: productId, stock: { $gte: 1 } };
      updateQuery = { $inc: { stock: -1 } };
    }

    // Atomically check and decrement stock
    const updated = await Product.updateOne(stockQuery, updateQuery, {
      session,
    });
    if (updated.modifiedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "No more stock available",
      });
    }

    // Update reservation
    reservation.products[prodIdx].quantity += 1;
    reservation.reservedAt = new Date();
    await reservation.save({ session });

    await session.commitTransaction();
    return res.json({
      success: true,
      message: "Stock incremented successfully",
      newQuantity: reservation.products[prodIdx].quantity,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Increment reservation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const verifyReservation = async (req, res) => {
  dbConnect();
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: "Cart ID is required",
      });
    }

    const reservation = await Reservation.findOne({ cartId });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Cart reservation not found or expired",
      });
    }

    // Check if reservation is expired (older than 2 days)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    if (reservation.reservedAt < twoDaysAgo) {
      return res.status(400).json({
        success: false,
        message: "Cart reservation has expired",
      });
    }

    // Check if reservation has products
    if (!reservation.products || reservation.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    return res.json({
      success: true,
      message: "Cart reservation is valid",
      data: {
        cartId: reservation.cartId,
        productsCount: reservation.products.length,
        reservedAt: reservation.reservedAt,
      },
    });
  } catch (error) {
    console.error("Verify reservation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  reserveStock,
  releaseStock,
  decrementReservationStock,
  incrementReservationStock,
  verifyReservation,
};
