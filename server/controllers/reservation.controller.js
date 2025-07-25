const reservationModel = require("../models/reservation.model.js");
const productModel = require("../models/product.model.js");
const mongoose = require("mongoose");
const dbConnect = require("../config/dbConnect.js");

const reserveStock = async (req, res) => {
  dbConnect();
  // Start a MongoDB session to track/record multiple operations as a single transaction.
  // This allows us to commit all changes together or roll them back entirely if any operation fails.
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  try {
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity) {
      await mongoSession.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let requestedQuantity = quantity;

    // Find product
    const product = await productModel
      .findById(productId)
      .session(mongoSession);

    if (!product) {
      await mongoSession.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check and decrement stock
    let stockAvailable;
    let actualQuantity = requestedQuantity;
    const MAX_RETRIES = 3; // used to restart verification of stock if it was changed in the middle of a transaction

    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      if (!variant) {
        await mongoSession.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: "Variant required" });
      }

      stockAvailable = product.stock[variant] || 0;

      if (stockAvailable === 0) {
        await mongoSession.abortTransaction();
        return res.status(400).json({
          success: false,
          stock: 0,
          message: "Stock not available",
        });
      }

      if (stockAvailable < requestedQuantity) {
        actualQuantity = stockAvailable; // Give the max available stock to the user
      }

      // Retry logic for stock update
      let updated = null;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Re-check stock before each attempt
        const freshProduct = await productModel
          .findById(productId)
          .session(mongoSession);
        const currentStock = freshProduct.stock[variant] || 0;

        if (currentStock === 0) {
          await mongoSession.abortTransaction();
          return res.status(400).json({
            success: false,
            stock: 0,
            message: "Stock not available",
          });
        }

        // Adjust quantity if needed
        const availableQuantity = Math.min(actualQuantity, currentStock);

        const update = {};
        update[`stock.${variant}`] = -availableQuantity;

        // If someone else has changed the stock since we checked, this will fail
        updated = await productModel.updateOne(
          { _id: productId, [`stock.${variant}`]: { $gte: availableQuantity } },
          { $inc: update },
          { session: mongoSession } // attach the session to the operation
        );

        // If 0 documents were modified, it means stock was changed by an other user during a transaction
        if (updated.modifiedCount > 0) {
          actualQuantity = availableQuantity;
          stockAvailable = currentStock;
          break; // Success! Exit retry loop
        }

        // If this was the last attempt, give up
        if (attempt === MAX_RETRIES) {
          await mongoSession.abortTransaction();
          return res.status(409).json({
            success: false,
            stock: -1, // Special indicator for concurrent modification
            message:
              "Stock is being modified frequently. Please try again later.",
            retryAfter: 2000, // Suggest client retry after 2 seconds
          });
        }

        // Wait a bit before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 100));
      }
    } else {
      // For toys Stock is a single number
      stockAvailable = product.stock;

      if (stockAvailable === 0) {
        await mongoSession.abortTransaction();
        return res.status(400).json({
          success: false,
          stock: 0,
          message: "Stock not available",
        });
      }

      if (stockAvailable < requestedQuantity) {
        actualQuantity = stockAvailable; // Give the max available stock to the user
      }

      // Retry logic for toys
      let updated = null;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Re-check stock before each attempt
        const freshProduct = await productModel
          .findById(productId)
          .session(mongoSession);
        const currentStock = freshProduct.stock;

        if (currentStock === 0) {
          await mongoSession.abortTransaction();
          return res.status(400).json({
            success: false,
            stock: 0,
            message: "Stock not available",
          });
        }

        // Adjust quantity if needed
        const availableQuantity = Math.min(actualQuantity, currentStock);

        // If someone else has changed the stock since we checked, this will fail
        updated = await productModel.updateOne(
          { _id: productId, stock: { $gte: availableQuantity } },
          { $inc: { stock: -availableQuantity } },
          { session: mongoSession } // attach the session to the operation
        );
        // If 0 documents were modified, it means stock was changed by an other user during a transaction
        if (updated.modifiedCount > 0) {
          actualQuantity = availableQuantity;
          stockAvailable = currentStock;
          break; // Success! Exit retry loop
        }

        // If this was the last attempt, give up
        if (attempt === MAX_RETRIES) {
          await mongoSession.abortTransaction();
          return res.status(409).json({
            success: false,
            stock: -1, // Special indicator for concurrent modification
            message:
              "Stock is being modified frequently. Please try again later.",
            retryAfter: 2000, // Suggest client retry after 2 seconds
          });
        }

        // Wait a bit before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 100));
      }
    }

    // Upsert reservation
    let reservation = await reservationModel
      .findOne({ cartId })
      .session(mongoSession);
    if (!reservation) {
      reservation = new reservationModel({ cartId, products: [] });
    }

    // Find if product already reserved
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );

    // If index is found, increment quantity, else add new product
    if (prodIdx !== -1) {
      reservation.products[prodIdx].quantity += actualQuantity;
    } else {
      reservation.products.push({
        productId,
        variant,
        quantity: actualQuantity,
      });
    }
    reservation.reservedAt = new Date();
    await reservation.save({ session: mongoSession }); // attach the session to the save operation
    // Commit the transaction
    await mongoSession.commitTransaction();

    if (stockAvailable < requestedQuantity) {
      return res.json({
        success: true,
        stock: stockAvailable - actualQuantity,
        message: `Only ${actualQuantity} items reserved, stock was less than requested`,
        reservedQuantity: actualQuantity,
        requestedQuantity: requestedQuantity,
      });
    }
    return res.json({
      success: true,
      stock: stockAvailable - actualQuantity,
      message: "Stock reserved",
      reservedQuantity: actualQuantity,
      requestedQuantity: requestedQuantity,
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("Error in reserveStock:", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  } finally {
    // End the session
    mongoSession.endSession();
  }
};

// USED IN CART.JSX FOR DECREMENTING RESERVATION STOCK
const decrementReservationStock = async (req, res) => {
  dbConnect();
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();
    const { cartId, productId, variant, quantity } = req.body;
    if (!cartId || !productId || !quantity || !variant) {
      await mongoSession.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    let reservation = await reservationModel
      .findOne({ cartId })
      .session(mongoSession);

    if (!reservation) {
      await mongoSession.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    // Find if product is in reservation
    const prodIdx = reservation.products.findIndex(
      (p) => p.productId.toString() === productId && p.variant === variant
    );
    // product not found in reservation
    if (prodIdx === -1) {
      await mongoSession.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not reserved" });
    }

    // Atomically increment stock in product
    const product = await productModel
      .findById(productId)
      .session(mongoSession);
    if (!product) {
      await mongoSession.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let newStock;
    if (
      product.category === "comics" ||
      product.category === "clothes" ||
      product.category === "shoes"
    ) {
      const update = {};
      update[`stock.${variant}`] = quantity;
      await productModel.updateOne(
        { _id: productId },
        { $inc: update },
        { session: mongoSession }
      );
      newStock = (product.stock[variant] || 0) + quantity;
    } else {
      await productModel.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } },
        { session: mongoSession }
      );
      newStock = product.stock + quantity;
    }

    // Update or remove product from reservation
    if (reservation.products[prodIdx].quantity > quantity) {
      reservation.products[prodIdx].quantity -= quantity;
    } else {
      reservation.products.splice(prodIdx, 1);
    }
    reservation.reservedAt = new Date();
    if (reservation.products.length === 0) {
      await reservationModel
        .deleteOne({ _id: reservation._id })
        .session(mongoSession);
    } else {
      await reservation.save({ session: mongoSession });
    }

    await mongoSession.commitTransaction();

    return res.json({
      success: true,
      stock: newStock,
      message: "Reservation decremented and stock restored",
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("Error in decrementReservationStock:", {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  } finally {
    mongoSession.endSession();
  }
};

module.exports = { reserveStock, decrementReservationStock };
