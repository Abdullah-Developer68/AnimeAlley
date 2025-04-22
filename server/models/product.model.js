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
  stock: {
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
  genre: {
    type: [String],
    required: function () {
      return this.category === "comics";
    },
  },
  //variants section in productDes.jx
  size: {
    type: [String],
    required: function () {
      return this.category === "clothes" || this.category === "shoes";
    },
  },
  volume: {
    type: [String],

    required: function () {
      return this.category === "comics";
    },
  },
  //for filter bar
  merchType: {
    type: [String],
    required: function () {
      return this.category === "clothes" || this.category === "shoes";
    },
  },
  toyType: {
    type: [String],
    required: function () {
      return this.category === "toys";
    },
  },
});

// A virtual field is a property that doesn’t get saved in the MongoDB database — it is calculated dynamically
//  when you access the document in your code
productSchema.virtual("totalPrice").get(function () {
  return this.price * this.quantity;
});

// By default, virtual fields are not included when you convert your Mongoose document to JSON
// or a plain JS object. so this tells mongoose to do it
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("products", productSchema);
