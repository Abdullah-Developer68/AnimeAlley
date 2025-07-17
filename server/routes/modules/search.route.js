const express = require("express");
const router = express.Router();
const { findProducts } = require("../../controllers/product.controller");

router.get("/products", findProducts);

module.exports = router;
