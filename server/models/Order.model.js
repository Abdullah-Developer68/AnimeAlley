const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
  },
  ProductsID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products", // tells that ids are from products model
      required: true,
    },
  ],
  CustomerID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  ],
});

module.exports = mongoose.model("orders", orderSchema);
