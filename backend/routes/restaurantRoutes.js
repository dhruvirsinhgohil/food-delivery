const express = require("express");

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
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

router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveRestaurant
);

module.exports = router;