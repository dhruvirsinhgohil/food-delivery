const express = require("express");

const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getFoods);
router.get("/:id", getFoodById);

// Restaurant
router.post(
  "/",
  protect,
  authorize("restaurant"),
  upload.single("image"),
  createFood
);

router.put(
  "/:id",
  protect,
  authorize("restaurant"),
  upload.single("image"),
  updateFood
);

router.delete(
  "/:id",
  protect,
  authorize("restaurant"),
  deleteFood
);

module.exports = router;