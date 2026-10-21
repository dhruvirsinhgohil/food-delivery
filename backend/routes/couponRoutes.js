const express = require("express");

const {
  createCoupon,
  getCoupons,
  getAllCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getCoupons);
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllCoupons
);
router.get("/code/:code", getCouponByCode);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  createCoupon
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCoupon
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCoupon
);

module.exports = router;