const Wishlist = require("../models/Wishlist");
const Food = require("../models/Food");

// GET WISHLIST
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user.userId,
    }).populate("foods");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.userId,
        foods: [],
      });
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD TO WISHLIST
const addToWishlist = async (req, res) => {
  try {
    const { foodId } = req.body;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user.userId,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.userId,
        foods: [foodId],
      });
    } else {
      const alreadyExists = wishlist.foods.some(
        (id) => id.toString() === foodId
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Food already in wishlist",
        });
      }

      wishlist.foods.push(foodId);
      await wishlist.save();
    }

    await wishlist.populate("foods");

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user.userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.foods = wishlist.foods.filter(
      (id) => id.toString() !== req.params.foodId
    );

    await wishlist.save();
    await wishlist.populate("foods");

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};