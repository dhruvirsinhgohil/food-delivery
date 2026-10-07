const express = require("express");

const {
  createDeliveryPartner,
  getDeliveryPartners,
} = require("../controllers/deliveryPartnercontroller");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates delivery partner
router.post(
  "/",
  protect,
  authorize("admin"),
  createDeliveryPartner
);

// Admin gets all delivery partners
router.get(
  "/",
  protect,
  authorize("admin"),
  getDeliveryPartners
);

module.exports = router;