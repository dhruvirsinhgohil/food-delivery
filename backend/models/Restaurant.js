const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    cuisines: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    deliveryTime: {
      type: Number,
      default: 30,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);