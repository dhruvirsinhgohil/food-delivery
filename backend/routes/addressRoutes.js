const express = require("express");

const {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyAddresses);

router.post("/", protect, createAddress);

router.put("/:id", protect, updateAddress);

router.delete("/:id", protect, deleteAddress);

module.exports = router;