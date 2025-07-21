const express = require("express");
const router = express.Router();
const {
  reserveStock,
  releaseStock,
  decrementReservationStock,
} = require("../../controllers/reservation.controller.js");

router.post("/reserveStock", reserveStock);
router.post("/releaseStock", releaseStock);
router.post("/decrementReservationStock", decrementReservationStock);

module.exports = router;
