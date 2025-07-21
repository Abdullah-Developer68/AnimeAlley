const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/modules/multerConfig.js");
const {
  getProducts,
  createProduct,
  verifyStock,
  deleteProduct,
  updateProduct,
} = require("../../controllers/product.controller.js");

// get requests
router.get("/getProducts", getProducts);
router.get("/verifyStock", verifyStock);

// post requests
router.post("/createProduct", upload.single("image"), createProduct);
router.post("/deleteProduct", deleteProduct);
router.put("/updateProduct", upload.single("image"), updateProduct);

module.exports = router;
