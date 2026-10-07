const Delivery = require("../models/Delivery");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

// CREATE DELIVERY
const createDelivery = async (req, res) => {
  try {
    const { orderId, estimatedTime } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const existingDelivery = await Delivery.findOne({
      order: orderId,
    });

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery already created",
      });
    }

    const delivery = await Delivery.create({
      order: orderId,
      estimatedTime: estimatedTime || 30,
      status: "assigned",
    });

    res.status(201).json({
      success: true,
      message: "Delivery created",
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DELIVERY BY ORDER
const getDeliveryByOrder = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      order: req.params.orderId,
    })
      .populate(
        "deliveryPartner",
        "user vehicleType vehicleNumber currentLocation rating"
      )
      .populate("order");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ASSIGN DELIVERY PARTNER
const assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    const partner = await DeliveryPartner.findById(
      deliveryPartnerId
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        deliveryPartner: deliveryPartnerId,
        status: "assigned",
      },
      {
        new: true,
      }
    );

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    partner.isAvailable = false;
    await partner.save();

    res.status(200).json({
      success: true,
      message: "Delivery partner assigned",
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE DELIVERY STATUS
const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(
      req.params.id
    ).populate("deliveryPartner");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // Delivery partner can update only their own delivery
    if (req.user.role === "delivery") {
      if (
        !delivery.deliveryPartner ||
        delivery.deliveryPartner.user.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only update your assigned delivery",
        });
      }
    }

    const { status } = req.body;

    const allowedStatuses = [
      "assigned",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    delivery.status = status;

    if (status === "picked_up") {
      delivery.pickedUpAt = new Date();
    }

    if (status === "delivered") {
      delivery.deliveredAt = new Date();
    }

    await delivery.save();

    res.status(200).json({
      success: true,
      message: "Delivery status updated",
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE DELIVERY LOCATION
const updateDeliveryLocation = async (req, res) => {
  try {
    const delivery = await Delivery.findById(
      req.params.id
    ).populate("deliveryPartner");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    if (req.user.role === "delivery") {
      if (
        !delivery.deliveryPartner ||
        delivery.deliveryPartner.user.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only update your own delivery location",
        });
      }
    }

    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required",
      });
    }

    delivery.currentLocation = {
      latitude,
      longitude,
    };

    await delivery.save();

    res.status(200).json({
      success: true,
      message: "Delivery location updated",
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createDelivery,
  getDeliveryByOrder,
  assignDeliveryPartner,
  updateDeliveryStatus,
  updateDeliveryLocation,
};