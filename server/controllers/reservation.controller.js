// server/controllers/reservation.controller.js
const Reservation = require("../models/reservation.model");
const Product = require("../models/product.model");

const reserveStock = async (req, res) => {
  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Check and decrement stock (same as before)
    let stockAvailable;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      if (!variant)
        return res
          .status(400)
          .json({ success: false, message: "Variant required" });
      stockAvailable = product.stock[variant] || 0;
      if (stockAvailable < quantity)
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock" });
      const update = {};
      update[`stock.${variant}`] = -quantity;
      const updated = await Product.updateOne(
        { _id: productId, [`stock.${variant}`]: { $gte: quantity } },
        { $inc: update }
      );
      if (updated.modifiedCount === 0)
        return res
          .status(400)
          .json({ success: false, message: "Stock changed, try again" });
    } else {
      stockAvailable = product.stock;
      if (stockAvailable < quantity)
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock" });
      const updated = await Product.updateOne(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
      if (updated.modifiedCount === 0)
        return res
          .status(400)
          .json({ success: false, message: "Stock changed, try again" });
    }

    // Upsert reservation (new model)
    let reservation = await Reservation.findOne({ cartId });
    if (!reservation) {
      reservation = new Reservation({ cartId, products: [] });
    }
    // Find if product already reserved
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx !== -1) {
      reservation.products[prodIdx].quantity += quantity;
    } else {
      reservation.products.push({ productId, variant, quantity });
    }
    reservation.reservedAt = new Date();
    await reservation.save();

    return res.json({ success: true, message: "Stock reserved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const releaseStock = async (req, res) => {
  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let reservation = await Reservation.findOne({ cartId });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx === -1)
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });

    // Atomically increment stock
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      const update = {};
      update[`stock.${variant}`] = quantity;
      await Product.updateOne({ _id: productId }, { $inc: update });
    } else {
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      );
    }

    // Update or remove product from reservation
    if (reservation.products[prodIdx].quantity > quantity) {
      reservation.products[prodIdx].quantity -= quantity;
    } else {
      reservation.products.splice(prodIdx, 1);
    }
    reservation.reservedAt = new Date();
    if (reservation.products.length === 0) {
      await Reservation.deleteOne({ _id: reservation._id });
    } else {
      await reservation.save();
    }

    return res.json({ success: true, message: "Stock released" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const decrementReservationStock = async (req, res) => {
  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let reservation = await Reservation.findOne({ cartId });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    if (prodIdx === -1)
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });

    // Atomically increment stock in product
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      const update = {};
      update[`stock.${variant}`] = quantity;
      await Product.updateOne({ _id: productId }, { $inc: update });
    } else {
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      );
    }

    // Update or remove product from reservation
    if (reservation.products[prodIdx].quantity > quantity) {
      reservation.products[prodIdx].quantity -= quantity;
    } else {
      reservation.products.splice(prodIdx, 1);
    }
    reservation.reservedAt = new Date();
    if (reservation.products.length === 0) {
      await Reservation.deleteOne({ _id: reservation._id });
    } else {
      await reservation.save();
    }

    return res.json({
      success: true,
      message: "Reservation decremented and stock restored",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { reserveStock, releaseStock, decrementReservationStock };
