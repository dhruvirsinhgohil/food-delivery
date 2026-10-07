const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "assigned",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "assigned",
    },

    estimatedTime: {
      type: Number,
      default: 30,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
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

    deliveryNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);