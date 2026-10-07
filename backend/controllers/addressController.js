const Address = require("../models/Address");

// CREATE ADDRESS
const createAddress = async (req, res) => {
  try {
    const {
      addressType,
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { user: req.user.userId },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: req.user.userId,
      addressType,
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY ADDRESSES
const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.userId },
        { isDefault: false }
      );
    }

    Object.keys(req.body).forEach((key) => {
      address[key] = req.body[key];
    });

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
};