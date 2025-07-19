const multer = require("multer");
const storage = require("../../config/cloudinaryMulter");

const upload = multer({ storage }); // this is using cloud storage

module.exports = upload;
