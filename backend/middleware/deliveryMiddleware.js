const deliveryOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "delivery") {
    return res.status(403).json({
      success: false,
      message: "Delivery partner access required",
    });
  }

  next();
};

module.exports = deliveryOnly;