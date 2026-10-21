const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");
// =====================================
// CREATE FOOD
// =====================================

const createFood = async (req, res) => {
  try {
    const {
      restaurant,
      category,
      name,
      description,
      price,
      discount,
      foodType,
      ingredients,
      isAvailable,
    } = req.body;

    // Check restaurant ownership
    const restaurantQuery = { _id: restaurant };
    if (req.user.role !== "admin") {
      restaurantQuery.owner = req.user.userId;
    }
    const restaurantData = await Restaurant.findOne(restaurantQuery);

    if (!restaurantData) {
      return res.status(403).json({
        success: false,
        message: "You can only add food to a restaurant you manage",
      });
    }

    let image = req.body.image || "";

    if (req.file) {
      image = `/uploads/foods/${req.file.filename}`;
    }

    const food = await Food.create({
      restaurant,
      category,
      name,
      description,
      image,
      price,
      discount,
      foodType,
      ingredients,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET FOODS
// =====================================

// const getFoods = async (req, res) => {
//   try {
//     const { restaurant, category, foodType } = req.query;

//     const filter = {
//       isAvailable: true,
//     };

//     if (restaurant) {
//       filter.restaurant = restaurant;
//     }

//     if (category) {
//       filter.category = category;
//     }

//     if (foodType) {
//       filter.foodType = foodType;
//     }

//     const foods = await Food.find(filter)
//       .populate("restaurant", "name image rating")
//       .populate("category", "name image")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: foods.length,
//       foods,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// =====================================
// GET FOODS (RESTAURANT-WISE)
// =====================================


const getFoods = async (req, res) => {
  try {
    const { restaurant, category, foodType, includeUnavailable } = req.query;

    const filter = {};

    if (includeUnavailable !== "true") {
      filter.isAvailable = { $ne: false };
    }

    // Filter foods by restaurant ID
    if (restaurant) {
      if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = new mongoose.Types.ObjectId(restaurant);
    }

    // Filter by category ID
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = new mongoose.Types.ObjectId(category);
    }

    // Filter by food type: veg, non-veg, vegan
    if (foodType) {
      if (!["veg", "non-veg", "vegan"].includes(foodType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid food type",
        });
      }

      filter.foodType = foodType;
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name image rating isOpen isActive")
      .populate("category", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
};



// =====================================
// GET SINGLE FOOD
// =====================================

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate("restaurant", "name image rating isOpen isActive")
      .populate("category", "name image");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// UPDATE FOOD
// =====================================

const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Check restaurant ownership
    const restaurantQuery = { _id: food.restaurant };
    if (req.user.role !== "admin") {
      restaurantQuery.owner = req.user.userId;
    }
    const restaurant = await Restaurant.findOne(restaurantQuery);

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You can only update food for a restaurant you manage",
      });
    }

    const {
      name,
      description,
      price,
      discount,
      foodType,
      ingredients,
      isAvailable,
      category,
    } = req.body;

    if (name !== undefined) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = price;
    if (discount !== undefined) food.discount = discount;
    if (foodType !== undefined) food.foodType = foodType;
    if (ingredients !== undefined) food.ingredients = ingredients;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;
    if (category !== undefined) food.category = category;
    if (req.body.image !== undefined) food.image = req.body.image;

    if (req.file) {
      food.image = `/uploads/foods/${req.file.filename}`;
    }

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// DELETE FOOD
// =====================================

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    const restaurantQuery = { _id: food.restaurant };
    if (req.user.role !== "admin") {
      restaurantQuery.owner = req.user.userId;
    }
    const restaurant = await Restaurant.findOne(restaurantQuery);

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You can only delete food for a restaurant you manage",
      });
    }

    food.isAvailable = false;

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
};