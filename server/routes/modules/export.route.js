const express = require("express");
const router = express.Router();
const { exportData } = require("../../controllers/export.controller.js");

// Generic route for exporting data
// Example: GET /api/export/users?format=excel
router.get("/:dataType", exportData);

module.exports = router;
