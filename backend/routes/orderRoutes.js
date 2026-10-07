const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer
router.post("/", protect, createOrder);

// IMPORTANT: before /:id
router.get("/my-orders", protect, getMyOrders);

// Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllOrders
);

// Single order
router.get("/:id", protect, getOrderById);

// Cancel order
router.patch("/:id/cancel", protect, cancelOrder);

// Update status
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);

module.exports = router;