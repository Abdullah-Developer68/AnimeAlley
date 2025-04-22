const productModel = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    const { category, productConstraints, currPage } = req.body;

    if (!category || !currPage) {
      return res.status(400).json({
        success: false,
        message: "Category and currPage is required",
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
    let products = await productModel.find(query);
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

    // Get products for current page using slice
    const itemsPerPage = 20;
    const startIndex = (currPage - 1) * itemsPerPage; // Assuming currPage starts from 1
    const endIndex = startIndex + 20;
    const currPageProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / 20); // Calculate total pages

    res.status(200).json({ success: true, currPageProducts, totalPages });
  } catch (error) {
    console.error("Error while fetching products:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
};
