const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const Food = require("../models/Food");
const Coupon = require("../models/Coupon");

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { address, couponCode } = req.body;

    // ================================
    // GET CART
    // ================================

    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ================================
    // CHECK FOOD AVAILABILITY
    // ================================

    for (const item of cart.items) {
      if (!item.food) {
        return res.status(400).json({
          success: false,
          message: "One of the food items no longer exists",
        });
      }

      if (!item.food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${item.food.name} is currently unavailable`,
        });
      }
    }

    // ================================
    // CHECK SAME RESTAURANT
    // ================================

    const restaurantId =
      cart.items[0].food.restaurant.toString();

    const differentRestaurant = cart.items.some(
      (item) =>
        item.food.restaurant.toString() !== restaurantId
    );

    if (differentRestaurant) {
      return res.status(400).json({
        success: false,
        message:
          "You can only order food from one restaurant at a time",
      });
    }

    // ================================
    // CHECK ADDRESS
    // ================================

    const userAddress = await Address.findOne({
      _id: address,
      user: req.user.userId,
    });

    if (!userAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // ================================
    // CALCULATE SUBTOTAL
    // ================================

    const subtotal = cart.items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const deliveryFee = 40;

    const tax = Number(
      (subtotal * 0.05).toFixed(2)
    );

    // ================================
    // COUPON
    // ================================

    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon",
        });
      }

      const now = new Date();

      if (
        now < coupon.startDate ||
        now > coupon.expiryDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon has expired or is not active",
        });
      }

      if (
        coupon.usageLimit &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit reached",
        });
      }

      if (
        subtotal < coupon.minimumOrderAmount
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ${coupon.minimumOrderAmount}`,
        });
      }

      if (coupon.discountType === "percentage") {
        discount =
          (subtotal * coupon.discountValue) / 100;

        if (
          coupon.maximumDiscount &&
          discount > coupon.maximumDiscount
        ) {
          discount = coupon.maximumDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    // ================================
    // TOTAL
    // ================================

    const totalAmount = Number(
      (
        subtotal +
        deliveryFee +
        tax -
        discount
      ).toFixed(2)
    );

    // ================================
    // ORDER NUMBER
    // ================================

    const orderNumber = `ORD-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // ================================
    // CREATE ORDER
    // ================================

    const order = await Order.create({
      orderNumber,
      user: req.user.userId,
      restaurant: restaurantId,
      address,
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      coupon: coupon ? coupon._id : null,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "placed",
    });

    // ================================
    // CREATE ORDER ITEMS
    // ================================

    const orderItems = [];

    for (const item of cart.items) {
      const orderItem = await OrderItem.create({
        order: order._id,
        food: item.food._id,
        foodName: item.food.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      });

      orderItems.push(orderItem._id);
    }

    order.items = orderItems;

    await order.save();

    // ================================
    // UPDATE COUPON
    // ================================

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // ================================
    // CLEAR CART
    // ================================

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    const populatedOrder = await Order.findById(
      order._id
    )
      .populate("user", "name email phone")
      .populate("restaurant", "name image phone")
      .populate("address")
      .populate("items");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("restaurant", "name image")
      .populate("address")
      .populate("items")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("restaurant")
      .populate("address")
      .populate("items")
      .populate("coupon");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CANCEL ORDER
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      ["delivered", "cancelled", "out_for_delivery"].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.orderStatus = "cancelled";
    order.cancellationReason = reason || "";
    order.cancelledAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN GET ALL ORDERS
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("restaurant", "name")
      .populate("address")
      .populate("items")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "ready",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};