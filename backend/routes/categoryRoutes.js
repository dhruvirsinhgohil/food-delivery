const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCategory
);

module.exports = router;