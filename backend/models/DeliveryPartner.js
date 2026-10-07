const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "cycle", "car"],
      default: "bike",
    },

    vehicleNumber: {
      type: String,
      default: "",
    },

    licenseNumber: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);