const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const calculateTotal = (items) => {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

const getFoodPrice = (food) =>
  Number((food.price * (1 - Number(food.discount || 0) / 100)).toFixed(2));

// GET CART
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate({ path: "items.food", populate: { path: "restaurant", select: "name" } });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalAmount: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Food ID and valid quantity are required",
      });
    }

    const food = await Food.findById(foodId);

    if (!food || !food.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Food not available",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: food.restaurant,
      isActive: true,
      isOpen: true,
    });
    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "This restaurant is currently not accepting orders",
      });
    }

    let cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [
          {
            food: foodId,
            quantity,
            price: getFoodPrice(food),
          },
        ],
        totalAmount: getFoodPrice(food) * quantity,
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.food.toString() === foodId
      );

      if (existingItem) {
        existingItem.quantity += Number(quantity);
        existingItem.price = getFoodPrice(food);
      } else {
        cart.items.push({
          food: foodId,
          quantity,
          price: getFoodPrice(food),
        });
      }

      cart.totalAmount = calculateTotal(cart.items);

      await cart.save();
    }

    await cart.populate({ path: "items.food", populate: { path: "restaurant", select: "name" } });

    res.status(200).json({
      success: true,
      message: "Food added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CART ITEM
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.food.toString() === req.params.foodId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Food not found in cart",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.food.toString() !== req.params.foodId
      );
    } else {
      item.quantity = quantity;
    }

    cart.totalAmount = calculateTotal(cart.items);

    await cart.save();
    await cart.populate({ path: "items.food", populate: { path: "restaurant", select: "name" } });

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE CART ITEM
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== req.params.foodId
    );

    cart.totalAmount = calculateTotal(cart.items);

    await cart.save();
    await cart.populate({ path: "items.food", populate: { path: "restaurant", select: "name" } });

    res.status(200).json({
      success: true,
      message: "Food removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CLEAR CART
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};