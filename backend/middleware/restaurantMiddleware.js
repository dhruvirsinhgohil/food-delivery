const restaurantOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "restaurant") {
    return res.status(403).json({
      success: false,
      message: "Restaurant access required",
    });
  }

  next();
};

module.exports = restaurantOnly;