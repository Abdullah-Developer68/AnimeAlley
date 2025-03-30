const productModel = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }
    let products;
    if (category === "all") {
      products = await productModel.find({});
    } else {
      products = await productModel.find({ category });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error while fetching products:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
};
