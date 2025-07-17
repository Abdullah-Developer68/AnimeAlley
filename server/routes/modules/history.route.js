const express = require("express");
const router = express.Router();
const { getUserHistory } = require("../controllers/history.controller");

router.get("/userHistory", getUserHistory);

module.exports = router;
