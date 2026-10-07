const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "cod"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    transactionId: {
      type: String,
      default: "",
    },

    gateway: {
      type: String,
      default: "FakePaymentGateway",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);