const multer = require("multer");
const path = require("path");

// creates custom storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb is callback function arguments are (error, result) null -> no error occured
    // value of result changes according to the context here result -> filePath
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(err, result) here result -> fileName (image-1716567890123-874219387.png)
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// image upload configuration
const imageFilter = (req, file, cb) => {
  // Check file mimetype
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif"];

  if (!allowedExts.includes(ext)) {
    return cb(
      new Error("Only .jpg, .jpeg, .png and .gif files are allowed!"),
      false
    );
  }

  cb(null, true);
};

// creating multer middleware instance (object)
const upload = multer({
  storage, // Storage engine: where & how files are saved
  fileFilter: imageFilter, // only allows image files
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
