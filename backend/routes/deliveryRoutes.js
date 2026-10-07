const express = require("express");

const {
  createDelivery,
  getDeliveryByOrder,
  assignDeliveryPartner,
  updateDeliveryStatus,
  updateDeliveryLocation,
} = require("../controllers/deliveryController");

const { protect, authorize } =
  require("../middleware/authMiddleware");

const deliveryOnly =
  require("../middleware/deliveryMiddleware");

const router = express.Router();

// Admin creates delivery
router.post(
  "/",
  protect,
  authorize("admin"),
  createDelivery
);

// Authenticated users can view
router.get(
  "/order/:orderId",
  protect,
  getDeliveryByOrder
);

// Admin assigns partner
router.patch(
  "/:id/assign",
  protect,
  authorize("admin"),
  assignDeliveryPartner
);

// Delivery partner
router.patch(
  "/:id/status",
  protect,
  deliveryOnly,
  updateDeliveryStatus
);

router.patch(
  "/:id/location",
  protect,
  deliveryOnly,
  updateDeliveryLocation
);

module.exports = router;