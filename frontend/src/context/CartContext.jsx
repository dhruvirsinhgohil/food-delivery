import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./useAuth";
import { CartContext } from "./CartContextValue";
const GUEST_CART_KEY = "foodie-guest-cart";

function readGuestCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Unable to read the saved guest cart:", error);
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
}

function toCartItems(cart) {
  return (cart?.items || [])
    .filter((entry) => entry.food)
    .map((entry) => {
      const food = entry.food;
      return {
        _id: food._id || food.id,
        name: food.name || entry.foodName || "Food item",
        image: food.image || "",
        price: Number(entry.price ?? food.price ?? 0),
        quantity: Number(entry.quantity || 1),
        restaurant: food.restaurant?._id || food.restaurant || "",
        restaurantName: food.restaurant?.name || food.restaurantName || "",
      };
    });
}

function normalizeFood(food, restaurantFallback) {
  const restaurant = food.restaurant && typeof food.restaurant === "object" ? food.restaurant : restaurantFallback || {};
  if (restaurant.isOpen === false || restaurant.isActive === false) {
    throw new Error("This restaurant is currently not accepting orders.");
  }
  return {
    _id: food._id || food.id,
    name: food.name || "Food item",
    image: food.image || "",
    price: Number(food.price || 0) * (1 - Number(food.discount || 0) / 100),
    quantity: 1,
    restaurant: restaurant._id || restaurant.id || (typeof food.restaurant === "string" ? food.restaurant : "") || food.restaurantId || "",
    restaurantName: restaurant.name || food.restaurantName || "",
  };
}

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState(readGuestCart);
  const [loading, setLoading] = useState(Boolean(token));

  const applyRemoteCart = useCallback((cart) => {
    setCartItems(toCartItems(cart));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      applyRemoteCart(data.cart);
    } finally {
      setLoading(false);
    }
  }, [applyRemoteCart, token]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    const mergeGuestCart = async () => {
      try {
        const guestItems = readGuestCart();
        for (const item of guestItems) {
          await api.post("/cart", { foodId: item._id, quantity: item.quantity });
        }
        if (guestItems.length) localStorage.removeItem(GUEST_CART_KEY);
        const { data } = await api.get("/cart");
        if (active) applyRemoteCart(data.cart);
      } catch (error) {
        if (active) console.error("Unable to synchronize your cart:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    mergeGuestCart();
    return () => { active = false; };
  }, [applyRemoteCart, token]);

  useEffect(() => {
    if (!token) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems, token]);

  const addToCart = useCallback(async (food, restaurantFallback) => {
    const item = normalizeFood(food, restaurantFallback);
    if (!item._id) throw new Error("This food item is missing its ID.");
    if (!item.restaurant) throw new Error("This food item has no restaurant assigned.");
    if (cartItems.length && cartItems.some((existing) => existing.restaurant !== item.restaurant)) {
      throw new Error("Your cart can contain items from one restaurant at a time. Clear it to switch restaurants.");
    }
    if (token) {
      const { data } = await api.post("/cart", { foodId: item._id, quantity: 1 });
      applyRemoteCart(data.cart);
      return;
    }
    setCartItems((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      const next = existing
        ? current.map((entry) => entry._id === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry)
        : [...current, item];
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [applyRemoteCart, cartItems, token]);

  const changeQuantity = useCallback(async (foodId, quantity) => {
    if (token) {
      const { data } = await api.put(`/cart/${foodId}`, { quantity });
      applyRemoteCart(data.cart);
      return;
    }
    setCartItems((current) => {
      const next = current
        .map((item) => item._id === foodId ? { ...item, quantity } : item)
        .filter((item) => item.quantity > 0);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [applyRemoteCart, token]);

  const removeFromCart = useCallback(async (foodId) => {
    if (token) {
      const { data } = await api.delete(`/cart/${foodId}`);
      applyRemoteCart(data.cart);
      return;
    }
    setCartItems((current) => {
      const next = current.filter((item) => item._id !== foodId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [applyRemoteCart, token]);

  const clearCart = useCallback(async () => {
    if (token && cartItems.length) {
      const { data } = await api.delete("/cart/clear");
      applyRemoteCart(data.cart);
      return;
    }
    setCartItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, [applyRemoteCart, cartItems.length, token]);

  const value = useMemo(() => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    return {
      cartItems,
      loading,
      totalItems,
      totalPrice,
      addToCart,
      increaseQuantity: (foodId) => {
        const item = cartItems.find((entry) => entry._id === foodId);
        return item ? changeQuantity(foodId, item.quantity + 1) : Promise.resolve();
      },
      decreaseQuantity: (foodId) => {
        const item = cartItems.find((entry) => entry._id === foodId);
        return item ? changeQuantity(foodId, item.quantity - 1) : Promise.resolve();
      },
      removeFromCart,
      clearCart,
      refreshCart,
    };
  }, [addToCart, cartItems, changeQuantity, clearCart, loading, refreshCart, removeFromCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
