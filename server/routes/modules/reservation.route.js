const express = require("express");
const router = express.Router();
const {
  reserveStock,
  decrementReservationStock,
} = require("../../controllers/reservation.controller.js");

router.post("/reserveStock", reserveStock);
router.post("/decrementReservationStock", decrementReservationStock);

module.exports = router;
