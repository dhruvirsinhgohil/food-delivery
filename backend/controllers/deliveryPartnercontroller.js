const DeliveryPartner = require("../models/DeliveryPartner");
const User = require("../models/User");

// Create Delivery Partner
const createDeliveryPartner = async (req, res) => {
  try {
    const { userId, vehicleType, vehicleNumber, licenseNumber } = req.body;

    if (!userId || !vehicleType || !vehicleNumber || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "User must have delivery role",
      });
    }

    const existingPartner = await DeliveryPartner.findOne({
      user: userId,
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner already exists",
      });
    }

    const partner = await DeliveryPartner.create({
      user: userId,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      isAvailable: true,
      isOnline: true,
    });

    res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all delivery partners
const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find()
      .populate("user", "name email phone role");

    res.status(200).json({
      success: true,
      count: partners.length,
      partners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { isAvailable, isOnline } = req.body;
    if (typeof isAvailable !== "boolean" && typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Provide an availability or online status",
      });
    }

    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    if (typeof isAvailable === "boolean") partner.isAvailable = isAvailable;
    if (typeof isOnline === "boolean") partner.isOnline = isOnline;
    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Delivery partner status updated",
      partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
};