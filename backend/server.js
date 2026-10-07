const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const deliveryPartnerRoutes = require("./routes/deliveryPartnerRoutes");

dotenv.config();

const app = express();

// ===============================
// DATABASE
// ===============================

connectDB();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static("uploads"));

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/delivery-partners", deliveryPartnerRoutes);


// ===============================
// ROOT API
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Food Ordering API is running",
  });
});

app.use(notFound);
app.use(errorHandler);

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});