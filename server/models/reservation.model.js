const mongoose = require("mongoose");
const { Schema } = mongoose;

const reservationSchema = new Schema({
  cartId: {
    type: String,
    required: true,
    index: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      variant: {
        type: String, // e.g., size or volume
        required: false,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  reservedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("reservations", reservationSchema);
