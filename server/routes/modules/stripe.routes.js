const express = require("express");
const router = express.Router();
const stripeService = require("../../services/stripe.js");

router.post("/create-checkout-session", stripeService.createCheckoutSession);

module.exports = router;
