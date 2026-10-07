const express = require("express");

const {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateUserStatus,
  createRestaurantUser,
  createDeliveryUser,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// ADMIN
// =====================================

// Get all users
router.get(
  "/",
  protect,
  authorize("admin"),
  getUsers
);

// Get single user
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);

// Create restaurant account
router.post(
  "/restaurant",
  protect,
  authorize("admin"),
  createRestaurantUser
);

// Create delivery account
router.post(
  "/delivery",
  protect,
  authorize("admin"),
  createDeliveryUser
);

// Change user active status
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

// =====================================
// CUSTOMER
// =====================================

// Update own profile
router.put(
  "/profile",
  protect,
  updateProfile
);

// Change own password
router.put(
  "/change-password",
  protect,
  changePassword
);

module.exports = router;