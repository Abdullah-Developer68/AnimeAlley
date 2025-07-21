const express = require("express");
const router = express.Router();
const {
  reserveStock,
  releaseStock,
  decrementReservationStock,
  incrementReservationStock,
  verifyReservation,
} = require("../../controllers/reservation.controller.js");

router.post("/reserveStock", reserveStock);
router.post("/releaseStock", releaseStock);
router.post("/decrementReservationStock", decrementReservationStock);
router.post("/incrementReservationStock", incrementReservationStock);
router.get("/verify/:cartId", verifyReservation);

module.exports = router;
