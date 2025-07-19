const userModel = require("../models/user.model.js");
const {
  dataConfigs,
  generateExcel,
  generatePdf,
} = require("../services/export.service.js");
const dbConnect = require("../config/dbConnect.js");

const exportData = async (req, res) => {
  dbConnect();
  const { dataType } = req.params;
  const { email, format } = req.query;

  // --- Validation and Authorization ---
  if (!email || !format || !dataType) {
    return res
      .status(400)
      .json({ message: "Email, format, and data type are required!" });
  }

  const config = dataConfigs[dataType]; // selects appropriate config(user, product, coupon, order) based on dataType
  if (!config) {
    return res.status(400).json({ message: "Invalid data type specified." });
  }

  try {
    const adminUser = await userModel.findOne({ email });
    if (
      !adminUser ||
      (adminUser.role !== "admin" && adminUser.role !== "superAdmin")
    ) {
      return res.status(403).json({ message: "User is not authorized!" });
    }

    // --- File Generation ---
    if (format === "excel") {
      await generateExcel(res, config);
    } else if (format === "pdf") {
      await generatePdf(res, config);
    } else {
      return res.status(400).json({ message: "Invalid format specified." });
    }
  } catch (error) {
    console.error(`Error exporting ${dataType}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error during export.",
    });
  }
};

module.exports = {
  exportData,
};
