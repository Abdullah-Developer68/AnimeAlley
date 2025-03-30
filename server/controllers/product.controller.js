const productModel = require("../models/product.model");

let products;

const getProducts = async (req, res) => {
  try {
    const { category, productConstraints } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Build the query object
    const query = { category };

    // Add price filter if productConstraints has price
    if (productConstraints?.price) {
      query.price = { $gte: productConstraints.price };
    }

    // Add filter of the respective category, if productConstraints has activeFilters
    if (productConstraints?.activeFilters?.length > 0) {
      console.log("Active Filters:", productConstraints.activeFilters);
      console.log("Category:", category);

      if (category === "comics") {
        query.genre = { $in: productConstraints.activeFilters };
        console.log("Comics Query:", query);
      } else if (category === "clothes" || category === "shoes") {
        query.merchType = { $in: productConstraints.activeFilters };
        console.log("Clothes/Shoes Query:", query);
      } else if (category === "toys") {
        query.toyType = { $in: productConstraints.activeFilters };
        console.log("Toys Query:", query);
      }
    }

    // Get products with the filters
    products = await productModel.find(query);
    console.log("Found Products:", products.length);

    // Sort products if sortBy is specified
    if (productConstraints?.sortBy) {
      switch (productConstraints.sortBy) {
        case "popular":
          // You might want to add a popularity field to your schema
          // For now, we'll sort by price in descending order
          products.sort((a, b) => b.price - a.price);
          break;
        case "price-low":
          products.sort((a, b) => a.price - b.price); // ascending order
          break;
        case "price-high":
          products.sort((a, b) => b.price - a.price); // desending order
          break;
        default:
          break;
      }
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error while fetching products:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const sendTotalPages = async (req, res) => {
  const { currPage } = req.body;
  if (!currPage) {
    return res.status(400).json({
      success: false,
      message: "Current page is required",
    });
  }
  // const currProducts = products.slice(currPage * 20, (currPage + 1) * 20);
  let currProducts = [];
  for (let i = currPage * 20; i < products.length; i++) {
    for (let j = i - 20; j <= i; j++) {
      currProducts = products[j];
    }
  }
};
module.exports = {
  getProducts,
};
