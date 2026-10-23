
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import "../styles/RestaurantDetails.css";

function RestaurantDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [restaurantResponse, foodResponse] = await Promise.all([
          api.get(`/restaurants/${id}`, { signal: controller.signal }),
          api.get("/foods", {
            params: { restaurant: id, includeUnavailable: true },
            signal: controller.signal,
          }),
        ]);

        const restaurantData = restaurantResponse.data;
        const foodData = foodResponse.data;
         console.log("Restaurant API response:", restaurantData);
        console.log("Food API response:", foodData);
        const restaurantResult =
          restaurantData.restaurant ??
          restaurantData.data?.restaurant ??
          restaurantData.data ??
          restaurantData;

        const foodResult =
          foodData.foods ??
          foodData.data?.foods ??
          foodData.data ??
          [];

        if (!restaurantResult?._id) {
          throw new Error("Restaurant details were not returned by the API.");
        }

        if (!Array.isArray(foodResult)) {
          throw new Error("Restaurant food items were not returned by the API.");
        }

        setRestaurant(restaurantResult);
        setFoods(foodResult);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "Restaurant details error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load restaurant details."
        );
      } finally {
        if (!controller.signal.aborted) {
            setLoading(false);
        }
      }
    };

    if (id) {
      fetchRestaurantDetails();
    }

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/reviews/restaurant/${id}`)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch((requestError) => console.error("Unable to load restaurant reviews:", requestError.response?.data || requestError.message));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/wishlist")
      .then(({ data }) => setFavoriteIds((data.wishlist?.foods || []).map((food) => food._id)))
      .catch((requestError) => console.error("Unable to load saved foods:", requestError.response?.data || requestError.message));
  }, [isAuthenticated]);

  const categories = [
    "All",
    ...new Set(
      foods
        .map((food) =>
          typeof food.category === "object"
            ? food.category?.name
            : food.category
        )
        .filter(Boolean)
    ),
  ];

  const filteredFoods =
    activeCategory === "All"
      ? foods
      : foods.filter((food) => {
          const categoryName =
            typeof food.category === "object"
              ? food.category?.name
              : food.category;

          return categoryName === activeCategory;
        });

  const handleAddToCart = async (food) => {
    setActionMessage("");
    try {
      await addToCart(food, restaurant);
      setActionMessage(`${food.name} added to your cart.`);
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || requestError.message);
    }
  };

  const toggleFavorite = async (food) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/restaurants/${id}` } });
      return;
    }
    try {
      if (favoriteIds.includes(food._id)) {
        await api.delete(`/wishlist/${food._id}`);
        setFavoriteIds((current) => current.filter((foodId) => foodId !== food._id));
        setActionMessage(`${food.name} removed from your wishlist.`);
      } else {
        await api.post("/wishlist", { foodId: food._id });
        setFavoriteIds((current) => [...current, food._id]);
        setActionMessage(`${food.name} saved to your wishlist.`);
      }
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || "Unable to update your wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="restaurant-details-message">
        <div className="restaurant-details-spinner" />
        <p>Loading restaurant menu...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-details-message">
        <h2>Unable to load restaurant</h2>
        <p>{error || "Restaurant not found."}</p>
        <Link to="/restaurants" className="back-restaurants-btn">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <main className="restaurant-details-page">
      <Link to="/restaurants" className="restaurant-back-link">
        ← Back to Restaurants
      </Link>

      <section className="restaurant-details-hero">
        <div className="restaurant-details-info">
          <span className="restaurant-details-label">
            YOUR NEXT FOOD FAVORITE
          </span>

          <h1>{restaurant.name}</h1>

          <p>
            {restaurant.description ||
              "Discover delicious food prepared just for you."}
          </p>

          <div className="restaurant-details-meta">
            <span>🕒 {restaurant.deliveryTime || "30–40 min"}</span>

            <span>
              🛵{" "}
              {Number(restaurant.deliveryFee || 0) === 0
                ? "Free delivery"
                : `₹${restaurant.deliveryFee} delivery`}
            </span>

            <span>
              {restaurant.isOpen ? "🟢 Open now" : "🍽️ Restaurant"}
            </span>
          </div>

          {restaurant.cuisines && (
            <div className="restaurant-cuisines">
              {Array.isArray(restaurant.cuisines)
                ? restaurant.cuisines.join(" • ")
                : restaurant.cuisines}
            </div>
          )}
        </div>

        <div className="restaurant-details-image">
          {restaurant.image ? (
            <img
              src={getImageUrl(restaurant.image)}
              alt={restaurant.name}
            />

          ) : (
            <div className="restaurant-details-image-placeholder">
              🍽️
            </div>
          )}
        </div>
      </section>

      <section className="restaurant-menu-section">
        {actionMessage && <div className="commerce-alert success" role="status">{actionMessage}</div>}
        <div className="restaurant-menu-heading">
          <div>
            <span className="restaurant-details-label">MADE WITH LOVE</span>
            <h2>Explore the Menu</h2>
            <p>Find something delicious for your next meal.</p>
          </div>

          <span className="restaurant-food-count">
            {foods.length} items
          </span>
        </div>

        <div className="restaurant-category-list">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "restaurant-category active"
                  : "restaurant-category"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {foods.length === 0 ? (
          <div className="restaurant-menu-empty">
            <span>🍔</span>
            <h3>Menu coming soon!</h3>
            <p>
              No food items are currently listed for this restaurant.
            </p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="restaurant-menu-empty">
            <h3>No food in this category</h3>
            <p>Choose another category to explore the menu.</p>
          </div>
        ) : (
          <div className="restaurant-food-grid">
            {filteredFoods.map((food) => (
              <article className="restaurant-food-card" key={food._id}>
                <div className="restaurant-food-image">
                  {food.image ? (
                    <img
                      src={getImageUrl(food.image)}
                      alt={food.name}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.parentElement.classList.add("image-failed");
                      }}
                    />
                  ) : (
                    <div className="restaurant-food-placeholder">
                      🍲
                    </div>
                  )}

                  {food.foodType && (
                    <span className="restaurant-food-type">
                      {food.foodType === "veg"
                        ? "🟢 Veg"
                        : food.foodType === "vegan"
                        ? "🌱 Vegan"
                        : "🔴 Non-veg"}
                    </span>
                  )}
                  <button
                    type="button"
                    className={`menu-favorite-button ${favoriteIds.includes(food._id) ? "active" : ""}`}
                    aria-label={favoriteIds.includes(food._id) ? `Remove ${food.name} from wishlist` : `Save ${food.name} to wishlist`}
                    onClick={() => toggleFavorite(food)}
                  >
                    ♥
                  </button>
                </div>

                <div className="restaurant-food-content">
                  <h3>{food.name}</h3>

                  <p>
                    {food.description ||
                      "Freshly prepared and full of flavor."}
                  </p>

                  {food.discount > 0 && (
                    <span className="restaurant-food-discount">
                      {food.discount}% OFF
                    </span>
                  )}

                  <div className="restaurant-food-footer">
                    <strong>
                      ₹
                      {(
                        Number(food.price) *
                        (1 - Number(food.discount || 0) / 100)
                      ).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="restaurant-add-btn"
                      onClick={() => handleAddToCart(food)}
                      disabled={food.isAvailable === false}
                    >
                      {food.isAvailable === false ? "Unavailable" : "+ Add"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="restaurant-reviews-section">
        <div className="restaurant-menu-heading">
          <div>
            <span className="restaurant-details-label">REAL CUSTOMER NOTES</span>
            <h2>Reviews from food lovers</h2>
            <p>{reviews.length ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} from delivered orders.` : "Be the first to share your experience after ordering."}</p>
          </div>
          {reviews.length > 0 && <strong className="restaurant-review-average">★ {(reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)}</strong>}
        </div>
        {reviews.length ? <div className="restaurant-review-list">{reviews.slice(0, 6).map((review) => <article className="restaurant-review-card" key={review._id}>
          <div className="restaurant-review-card-top"><strong>{review.user?.name || "Food lover"}</strong><span>{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))}</span></div>
          {review.comment && <p>{review.comment}</p>}
          {review.food?.name && <small>About {review.food.name}</small>}
        </article>)}</div> : <div className="restaurant-menu-empty restaurant-reviews-empty"><span>💬</span><p>Reviews will appear here after customers complete their orders.</p></div>}
      </section>
    </main>
  );
}

export default RestaurantDetails;