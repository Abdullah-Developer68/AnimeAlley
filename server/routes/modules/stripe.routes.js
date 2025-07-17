const express = require("express");
const router = express.Router();
const stripeService = require("../../services/stripe");
router.post("/create-checkout-session", stripeService.createCheckoutSession);

module.exports = router;
