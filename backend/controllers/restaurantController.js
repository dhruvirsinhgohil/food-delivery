const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

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
      isOpen: true,
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

const getAdminRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      isActive: true,
      isOpen: true,
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

const updateRestaurantAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
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
      image,
    } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Restaurant name is required",
        });
      }
      updates.name = name;
    }
    if (description !== undefined) updates.description = description;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) {
      try {
        updates.address = typeof address === "string" ? JSON.parse(address) : address;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Address must be valid address data",
        });
      }
    }
    if (cuisines !== undefined) {
      let cuisineList = cuisines;
      try {
        if (typeof cuisines === "string") cuisineList = JSON.parse(cuisines);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Cuisines must be a valid list of names",
        });
      }
      if (!Array.isArray(cuisineList) || !cuisineList.every((cuisine) => typeof cuisine === "string")) {
        return res.status(400).json({
          success: false,
          message: "Cuisines must be a list of names",
        });
      }
      updates.cuisines = cuisineList;
    }
    if (deliveryTime !== undefined) updates.deliveryTime = deliveryTime;
    if (deliveryFee !== undefined) updates.deliveryFee = deliveryFee;
    if (req.file) updates.image = `/uploads/restaurants/${req.file.filename}`;
    else if (image !== undefined) updates.image = image;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
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
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true } },
      { returnDocument: "after", runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

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

const updateRestaurantAdminStatus = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
    if (typeof req.body.isOpen === "boolean") updates.isOpen = req.body.isOpen;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide an active or open status",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant status updated successfully",
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};