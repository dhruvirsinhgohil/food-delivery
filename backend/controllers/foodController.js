const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

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
    const restaurantData = await Restaurant.findOne({
      _id: restaurant,
      owner: req.user.userId,
    });

    if (!restaurantData) {
      return res.status(403).json({
        success: false,
        message: "You can only add food to your own restaurant",
      });
    }

    let image = "";

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

const getFoods = async (req, res) => {
  try {
    const { restaurant, category, foodType } = req.query;

    const filter = {
      isAvailable: true,
    };

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (category) {
      filter.category = category;
    }

    if (foodType) {
      filter.foodType = foodType;
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name image rating")
      .populate("category", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET SINGLE FOOD
// =====================================

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate("restaurant", "name image rating")
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
    const restaurant = await Restaurant.findOne({
      _id: food.restaurant,
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own food",
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

    const restaurant = await Restaurant.findOne({
      _id: food.restaurant,
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own food",
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