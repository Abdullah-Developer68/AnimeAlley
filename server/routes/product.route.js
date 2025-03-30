const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/product.controller");

// Handle both GET and POST requests for getting products
router.get("/getProducts", getProducts);
router.post("/getProducts", getProducts);

module.exports = router;
