const express = require("express");

const {
  register,
  login,
  getProfile,
} = require("../controllers/authControllers");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register customer
router.post("/register", register);

// Login
router.post("/login", login);

// Get logged-in user's profile
router.get("/profile", protect, getProfile);

module.exports = router;