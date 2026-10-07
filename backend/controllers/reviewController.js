const Review = require("../models/Review");
const Order = require("../models/Order");

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const {
      restaurant,
      food,
      order,
      rating,
      comment,
    } = req.body;

    const existingReview = await Review.findOne({
      user: req.user.userId,
      order,
      food: food || null,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this item",
      });
    }

    const userOrder = await Order.findOne({
      _id: order,
      user: req.user.userId,
      orderStatus: "delivered",
    });

    if (!userOrder) {
      return res.status(400).json({
        success: false,
        message: "You can review only delivered orders",
      });
    }

    const review = await Review.create({
      user: req.user.userId,
      restaurant,
      food: food || null,
      order,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RESTAURANT REVIEWS
const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      restaurant: req.params.restaurantId,
    })
      .populate("user", "name profileImage")
      .populate("food", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET FOOD REVIEWS
const getFoodReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      food: req.params.foodId,
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  deleteReview,
};