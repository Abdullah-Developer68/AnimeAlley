const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
  productID: {
    type: String,
    required: true,
  },
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
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
    required: function () {
      return this.category === "comics";
    },
  },
  sizes: {
    type: [String],
    required: function () {
      return this.category === "clothes" || this.category === "shoes";
    },
  },
  volumes: {
    type: [String],
    required: function () {
      return this.category === "comics";
    },
  },
  stock: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (value) {
        if (
          this.category === "comics" ||
          this.category === "clothes" ||
          this.category === "shoes"
        ) {
          const isObject = typeof value === "object" && value !== null;
          if (!isObject) return false;

          // Check that all stock values are non-negative integers
          const allValuesValid = Object.values(value).every(
            (stockValue) => Number.isInteger(stockValue) && stockValue >= 0
          );

          if (!allValuesValid) return false;

          if (this.category === "comics") {
            //  return true if -> volume exists && Object(stock) keys === volumes keys
            return (
              this.volumes &&
              Object.keys(value).every((key) => this.volumes.includes(key))
            );
          } else {
            //  return true if -> size exists && Object(stock) keys === sizes keys
            return (
              this.sizes &&
              Object.keys(value).every((key) => this.sizes.includes(key))
            );
          }
        } else {
          // For toys and other categories - stock should be a non-negative integer
          return (
            typeof value === "number" && Number.isInteger(value) && value >= 0
          );
        }
      },
      message: "Invalid stock format or negative stock not allowed",
    },
  },
  merchType: {
    type: String,
    required: function () {
      return this.category === "clothes" || this.category === "shoes";
    },
  },
  toyType: {
    type: String,
    required: function () {
      return this.category === "toys";
    },
  },
});

// Add text index on searchable fields
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("products", productSchema);

module.exports = Product;
