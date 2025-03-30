const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  size: {
    type: [String],
    required: function () {
      return this.category === "clothes" || "shoes";
    },
  },
  genre: {
    type: String,
    required: function () {
      return this.category === "comics";
    },
  },
});

module.exports = mongoose.model("products", productSchema);
