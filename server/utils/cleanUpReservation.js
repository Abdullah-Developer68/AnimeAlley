// server/utils/cleanupReservations.js
const Reservation = require("../models/reservation.model.js");
const Product = require("../models/product.model.js");

async function cleanupExpiredReservations() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const expired = await Reservation.find({ reservedAt: { $lt: twoDaysAgo } });

  for (const resv of expired) {
    const product = await Product.findById(resv.productId);
    if (product) {
      if (
        product.category === "comics" ||
        product.category === "clothes" ||
        product.category === "shoes"
      ) {
        const update = {};
        update[`stock.${resv.variant}`] = resv.quantity;
        await Product.updateOne({ _id: product._id }, { $inc: update });
      } else {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stock: resv.quantity } }
        );
      }
    }
    await Reservation.deleteOne({ _id: resv._id });
  }
}

module.exports = cleanupExpiredReservations;
