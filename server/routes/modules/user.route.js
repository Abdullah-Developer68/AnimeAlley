const express = require("express");
const router = express.Router();
const {
  getUsers,
  deleteUser,
  updateUser,
  checkUserRole,
} = require("../../controllers/user.controller");
const upload = require("../../middlewares/modules/multerConfig");

// Route to get a paginated list of all users (admin-only)
router.get("/getUsers", getUsers);

// Route to delete a user by ID
router.delete("/delete/:userId", deleteUser);

// Route to update a user by ID
router.put("/update/:userId", upload.single("profilePic"), updateUser);

// Route to check a user's role by email
router.get("/checkUserRole", checkUserRole);

module.exports = router;
