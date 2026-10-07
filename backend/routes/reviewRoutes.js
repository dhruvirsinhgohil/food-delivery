const express = require("express");

const {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);

router.get(
  "/restaurant/:restaurantId",
  getRestaurantReviews
);

router.get(
  "/food/:foodId",
  getFoodReviews
);

router.delete("/:id", protect, deleteReview);

module.exports = router;