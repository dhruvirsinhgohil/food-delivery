const Restaurant = require("../models/Restaurant");

// =====================================
// CREATE RESTAURANT
// =====================================

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      address,
      cuisines,
      deliveryTime,
      deliveryFee,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    // Check whether owner already has a restaurant
    const existingRestaurant = await Restaurant.findOne({
      owner: req.user.userId,
      isActive: true,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "You already have a restaurant",
      });
    }

    let image = "";

    if (req.file) {
      image = `/uploads/restaurants/${req.file.filename}`;
    }

    const restaurant = await Restaurant.create({
      owner: req.user.userId,
      name,
      description,
      image,
      phone,
      email,
      address,
      cuisines,
      deliveryTime,
      deliveryFee,
      isOpen: false,
      isApproved: false,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message:
        "Restaurant created successfully. Waiting for admin approval.",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET ALL RESTAURANTS
// =====================================

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
      isApproved: true,
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET RESTAURANT BY ID
// =====================================

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      isActive: true,
      isApproved: true,
    }).populate("owner", "name email phone");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET MY RESTAURANT
// =====================================

const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.userId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// UPDATE RESTAURANT
// =====================================

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.userId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      cuisines,
      deliveryTime,
      deliveryFee,
      isOpen,
    } = req.body;

    if (name !== undefined) restaurant.name = name;
    if (description !== undefined)
      restaurant.description = description;
    if (phone !== undefined) restaurant.phone = phone;
    if (email !== undefined) restaurant.email = email;
    if (address !== undefined) restaurant.address = address;
    if (cuisines !== undefined) restaurant.cuisines = cuisines;
    if (deliveryTime !== undefined)
      restaurant.deliveryTime = deliveryTime;
    if (deliveryFee !== undefined)
      restaurant.deliveryFee = deliveryFee;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    if (req.file) {
      restaurant.image = `/uploads/restaurants/${req.file.filename}`;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// DELETE RESTAURANT
// =====================================

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isActive = false;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// APPROVE RESTAURANT
// =====================================

const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(
      req.params.id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isApproved = true;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
};