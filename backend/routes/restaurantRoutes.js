const express = require("express");

const {
  createRestaurant,
  getRestaurants,
  getAdminRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  updateRestaurantAdmin,
  deleteRestaurant,
  approveRestaurant,
  updateRestaurantAdminStatus,
} = require("../controllers/restaurantController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================
// PUBLIC
// =====================================

router.get("/", getRestaurants);

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAdminRestaurants
);

// IMPORTANT: before /:id
router.get(
  "/owner/me",
  protect,
  authorize("restaurant"),
  getMyRestaurant
);

router.get("/:id", getRestaurantById);

// =====================================
// RESTAURANT OWNER
// =====================================

router.post(
  "/",
  protect,
  authorize("restaurant"),
  upload.single("image"),
  createRestaurant
);

router.put(
  "/:id",
  protect,
  authorize("restaurant"),
  upload.single("image"),
  updateRestaurant
);

router.delete(
  "/:id",
  protect,
  authorize("restaurant"),
  deleteRestaurant
);

// =====================================
// ADMIN
// =====================================

router.put(
  "/:id/admin",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateRestaurantAdmin
);

router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveRestaurant
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateRestaurantAdminStatus
);

module.exports = router;