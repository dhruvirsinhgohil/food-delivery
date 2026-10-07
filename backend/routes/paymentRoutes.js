const express = require("express");

const {
  createPayment,
  getPaymentByOrder,
  refundPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPayment);

router.get(
  "/order/:orderId",
  protect,
  getPaymentByOrder
);

router.patch(
  "/:id/refund",
  protect,
  authorize("admin"),
  refundPayment
);

module.exports = router;