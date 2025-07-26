const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const dbConnect = require("../config/dbConnect.js");

const getUsers = async (req, res) => {
  dbConnect();
  const { viewerEmail, currPage, searchQuery = "", role } = req.query;

  // Validate required parameters
  if (!viewerEmail || !currPage || !role) {
    return res.status(400).json({
      message: "Viewers Email, role and current page are required!",
    });
  }

  try {
    // Check if the requesting user is an admin or superAdmin
    const adminUser = await userModel.findOne({ email: viewerEmail });
    if (
      !adminUser ||
      (adminUser.role !== "admin" && adminUser.role !== "superAdmin")
    ) {
      return res.status(403).json({ message: "User is not authorized!" });
    }

    // --- Pagination Logic ---
    const usersPerPage = 20;
    const page = parseInt(currPage, 10) || 1;
    const startIndex = (page - 1) * usersPerPage;

    // Get the total count of all users
    const totalUsers = await userModel.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    let query = {};
    if (role !== "allUsers") {
      query.role = role;
    }
    if (searchQuery && searchQuery.length > 0) {
      if (searchQuery.includes("@") || searchQuery.includes(".")) {
        // Looks like an email, use regex for email
        query.email = { $regex: searchQuery, $options: "i" };
      } else {
        // Use text search for username/email
        query.$text = { $search: searchQuery };
      }
    }
    let requiredUsers;
    requiredUsers = await userModel
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(usersPerPage);

    // Respond with paginated user data
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      requiredUsers,
      totalUsers,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  dbConnect();
  try {
    const { userId } = req.params;
    const { editorEmail } = req.body;

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    if (!editorEmail) {
      return res.status(400).json({ message: "editor's Email is required." });
    }
    // Find the editor (admin making the change)
    const editor = await userModel.findOne({ email: editorEmail });
    if (!editor) {
      return res.status(404).json({ message: "editor not found." });
    }
    // Get the user being deleted
    const userToDelete = await userModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found." });
    }
    // Prevent self-deletion
    if (
      editor.email &&
      userToDelete.email &&
      editor.email === userToDelete.email
    ) {
      return res.status(403).json({ message: "You cannot delete yourself." });
    }
    // Users cannot delete anyone
    if (editor.role === "user") {
      return res
        .status(403)
        .json({ message: "Users are not authorized to delete anyone." });
    }
    // Admins can only delete users
    if (editor.role === "admin") {
      if (userToDelete.role !== "user") {
        return res
          .status(403)
          .json({ message: "Admins can only delete users." });
      }
    }
    // SuperAdmin can delete users and admins, but not other superAdmins
    if (editor.role === "superAdmin") {
      if (userToDelete.role === "superAdmin") {
        return res
          .status(403)
          .json({ message: "SuperAdmin cannot delete other superAdmins." });
      }
    }
    // Prevent deletion of the last superAdmin
    if (userToDelete.role === "superAdmin") {
      const superAdminCount = await userModel.countDocuments({
        role: "superAdmin",
      });
      if (superAdminCount <= 1) {
        return res
          .status(403)
          .json({ message: "Cannot delete the last superAdmin." });
      }
    }
    const result = await userModel.findByIdAndDelete(userId);
    res.status(200).json({
      success: true,
      message: `User with ID: ${userId} has been deleted.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const updateUser = async (req, res) => {
  dbConnect();
  try {
    const { userId } = req.params;
    const { username, email, role, createdAt, password, editorEmail } =
      req.body;
    // Find the editor (admin making the change)
    const editor = await userModel.findOne({ email: editorEmail });
    if (!editor) {
      return res.status(404).json({ message: "Editor not found." });
    }
    // Get the user being updated
    const userToUpdate = await userModel.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }
    // Allow users to update themselves (except their own role)
    if (editor._id.toString() === userToUpdate._id.toString()) {
      if (role && role !== userToUpdate.role) {
        return res
          .status(403)
          .json({ message: "You cannot change your own role." });
      }
      // Proceed to update self (other fields)
    } else {
      // Users cannot update anyone
      if (editor.role === "user") {
        return res
          .status(403)
          .json({ message: "Users are not authorized to update anyone." });
      }
      // Admins can only update users, and cannot change roles
      if (editor.role === "admin") {
        if (userToUpdate.role !== "user") {
          return res
            .status(403)
            .json({ message: "Admins can only update users." });
        }
        if (role && role !== userToUpdate.role) {
          return res
            .status(403)
            .json({ message: "Admins cannot change user roles." });
        }
      }
      // SuperAdmin can update users and admins, but not other superAdmins
      if (editor.role === "superAdmin") {
        if (userToUpdate.role === "superAdmin") {
          return res
            .status(403)
            .json({ message: "SuperAdmin cannot update other superAdmins." });
        }
        // SuperAdmin can only change roles between user/admin, not to superAdmin
        if (role && role !== userToUpdate.role) {
          if (role === "superAdmin") {
            return res
              .status(403)
              .json({ message: "Cannot promote anyone to superAdmin." });
          }
          if (userToUpdate.role === "superAdmin") {
            return res
              .status(403)
              .json({ message: "Cannot change role of a superAdmin." });
          }
          if (role !== "user" && role !== "admin") {
            return res.status(400).json({ message: "Invalid role change." });
          }
        }
      }
    }
    // Build update object
    const updateObj = {};
    if (username) updateObj.username = username;
    if (email) updateObj.email = email;
    // Handle createdAt with proper date validation
    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (!isNaN(parsedDate.getTime())) {
        updateObj.createdAt = parsedDate;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid date format for createdAt." });
      }
    }
    if (req.file) updateObj.profilePic = req.file.path; // Use path for Cloudinary URL
    if (password) {
      updateObj.password = await bcrypt.hash(password, 10);
    }
    // Only allow role change if superAdmin and valid
    if (
      editor.role === "superAdmin" &&
      role &&
      role !== userToUpdate.role &&
      role !== "superAdmin"
    ) {
      updateObj.role = role;
    }
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateObj, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update." });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const checkUserRole = async (req, res) => {
  dbConnect();
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "email is required." });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ success: true, role: user.role });
  } catch (error) {
    console.error("Error checking user role:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  updateUser,
  checkUserRole,
};
