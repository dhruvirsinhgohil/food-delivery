const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.put("/:foodId", protect, updateCartItem);

// IMPORTANT: /clear before /:foodId
router.delete("/clear", protect, clearCart);

router.delete("/:foodId", protect, removeFromCart);

module.exports = router;