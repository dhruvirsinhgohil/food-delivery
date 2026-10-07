const Payment = require("../models/Payment");
const Order = require("../models/Order");

const generatePaymentId = () => {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// CREATE FAKE PAYMENT
const createPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      order: order._id,
      user: req.user.userId,
      amount: order.totalAmount,
      method,
      status: "success",
      transactionId: generateTransactionId(),
      gateway: "FakePaymentGateway",
      paidAt: new Date(),
    });

    order.paymentStatus = "paid";

    await order.save();

    res.status(201).json({
      success: true,
      message: "Fake payment successful",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PAYMENT BY ORDER
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      order: req.params.orderId,
      user: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REFUND PAYMENT
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "refunded";

    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: "refunded",
    });

    res.status(200).json({
      success: true,
      message: "Fake refund successful",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPaymentByOrder,
  refundPayment,
};