
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiShoppingCart,
  FiStar,
  FiClock,
  FiRefreshCw,
  FiHeart,
} from "react-icons/fi";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import "../../styles/PopularFoods.css";

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${
    image.startsWith("/") ? image : `/${image}`
  }`;
}

function PopularFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchFoods = async () => {
    try {
      const response = await api.get("/foods");
      const payload = response.data;

      let foodList = [];

      if (Array.isArray(payload)) {
        foodList = payload;
      } else if (Array.isArray(payload.foods)) {
        foodList = payload.foods;
      } else if (Array.isArray(payload.data)) {
        foodList = payload.data;
      } else if (Array.isArray(payload.data?.foods)) {
        foodList = payload.data.foods;
      }

      setFoods(
        foodList
          .filter((food) => food.isAvailable !== false)
          .slice(0, 8)
      );
    } catch (err) {
      console.error("Failed to fetch foods:", err);
      setError("Unable to load food items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchFoods);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/wishlist")
      .then(({ data }) => setFavorites((data.wishlist?.foods || []).map((food) => food._id)))
      .catch((requestError) => console.error("Unable to load wishlist:", requestError.response?.data || requestError.message));
  }, [isAuthenticated]);

  const toggleFavorite = async (food) => {
    const foodId = getFoodId(food);
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    try {
      if (favorites.includes(foodId)) {
        await api.delete(`/wishlist/${foodId}`);
        setFavorites((current) => current.filter((id) => id !== foodId));
      } else {
        await api.post("/wishlist", { foodId });
        setFavorites((current) => [...current, foodId]);
      }
    } catch (requestError) {
      await Swal.fire({
        icon: "error",
        title: "Wishlist update failed",
        text: requestError.response?.data?.message || "Please try again.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleAddToCart = async (food) => {
    try {
      await addToCart(food);
      await Swal.fire({
        icon: "success",
        title: "Added to your cart",
        text: `${food.name} is ready for checkout.`,
        confirmButtonText: "Continue",
        confirmButtonColor: "#f97316",
      });
    } catch (requestError) {
      await Swal.fire({
        icon: "error",
        title: "Could not add this food",
        text: requestError.response?.data?.message || requestError.message,
        confirmButtonColor: "#f97316",
      });
    }
  };

  const getFoodId = (food) => food._id || food.id;

  return (
    <section className="popular-foods-section">
      <div className="popular-foods-container">
        <motion.div
          className="popular-foods-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="popular-foods-label">
              MADE FRESH FOR YOU
            </span>

            <h2>
              Popular <span>Food Items</span>
            </h2>

            <p>
              Delicious meals from our kitchen partners, delivered to your
              doorstep.
            </p>
          </div>

          <Link to="/restaurants" className="popular-foods-view-all">
            Explore menu <span>→</span>
          </Link>
        </motion.div>

        {loading && (
          <div className="popular-foods-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="food-skeleton" key={index}>
                <div className="food-skeleton-image" />
                <div className="food-skeleton-line" />
                <div className="food-skeleton-line short" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="popular-foods-message">
            <p>{error}</p>
            <button onClick={fetchFoods}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        )}

        {!loading && !error && foods.length === 0 && (
          <div className="popular-foods-message">
            <div className="food-empty-icon">🍽️</div>
            <h3>No food items available yet</h3>
            <p>Add some food items in your database to display them here.</p>
          </div>
        )}

        {!loading && !error && foods.length > 0 && (
          <div className="popular-foods-grid">
            {foods.map((food, index) => {
              const foodId = getFoodId(food);
              const imageUrl = getImageUrl(food.image);
              const isFavorite = favorites.includes(foodId);

              return (
                <motion.article
                  className="popular-food-card"
                  key={foodId || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: (index % 4) * 0.08,
                  }}
                  whileHover={{ y: -7 }}
                >
                  <div className="popular-food-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={food.name || "Food item"}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.parentElement.classList.add("image-failed");
                        }}
                      />
                    ) : (
                      <div className="food-image-placeholder">🍲</div>
                    )}

                    <span className="food-popular-badge">
                      {food.category?.name ||
                        food.categoryName ||
                        "Chef's Special"}
                    </span>

                    <button
                      type="button"
                      className={`food-favorite-button ${
                        isFavorite ? "active" : ""
                      }`}
                      onClick={() => toggleFavorite(food)}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <FiHeart />
                    </button>
                  </div>

                  <div className="popular-food-content">
                    <div className="popular-food-title-row">
                      <h3>{food.name || "Delicious Food"}</h3>

                      <div className="food-rating">
                        <FiStar />
                        <span>{Number(food.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="popular-food-description">
                      {food.description ||
                        "Freshly prepared with delicious ingredients."}
                    </p>

                    <div className="popular-food-meta">
                      <span>
                        <FiClock />
                        {food.preparationTime ||
                          food.preparationTimeMinutes ||
                          "20–30 min"}
                        {typeof food.preparationTime === "number"
                          ? " min"
                          : ""}
                      </span>

                      {food.restaurant?.name && (
                        <span className="food-restaurant-name">
                          {food.restaurant.name}
                        </span>
                      )}
                    </div>

                    <div className="popular-food-bottom">
                      <div className="popular-food-price">
                        <span>₹</span>
                        {(
                          Number(food.price || 0) *
                          (1 - Number(food.discount || 0) / 100)
                        ).toFixed(0)}
                      </div>

                      <button
                        type="button"
                        className="food-add-button"
                        onClick={() => handleAddToCart(food)}
                        disabled={food.isAvailable === false || food.restaurant?.isOpen === false || food.restaurant?.isActive === false}
                      >
                        <FiShoppingCart />
                        {food.restaurant?.isOpen === false ? "Closed" : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default PopularFoods;
