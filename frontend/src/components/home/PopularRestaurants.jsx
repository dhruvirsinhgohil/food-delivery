    import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import api from "../../api/axios";
import "../../styles/PopularRestaurants.css";

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function getRestaurantImage(restaurant) {
  if (!restaurant.image) return "";

  if (restaurant.image.startsWith("http")) {
    return restaurant.image;
  }

  return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${
    restaurant.image.startsWith("/") ? "" : "/"
  }${restaurant.image}`;
}

function RestaurantSkeleton() {
  return (
    <div className="restaurant-skeleton" aria-hidden="true">
      <div className="restaurant-skeleton-image" />
      <div className="restaurant-skeleton-line short" />
      <div className="restaurant-skeleton-line" />
      <div className="restaurant-skeleton-line medium" />
    </div>
  );
}

function PopularRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/restaurants");

      // Supports APIs returning an array directly or inside data/restaurants.
      const payload = response.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.restaurants)
          ? payload.restaurants
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.data?.restaurants)
              ? payload.data.restaurants
              : [];

      setRestaurants(list.filter((restaurant) => restaurant.isActive !== false));
    } catch (err) {
      console.error("Failed to load restaurants:", err);
      setError(
        "We couldn't load restaurants. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchRestaurants);
  }, []);

  return (
    <section className="popular-restaurants-section">
      <div className="popular-restaurants-container">
        <motion.div
          className="popular-restaurants-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="restaurants-eyebrow">
              <span className="restaurants-eyebrow-dot" />
              HANDPICKED FOR YOU
            </span>

            <h2>
              Popular{" "}
              <span className="restaurants-gradient">restaurants</span>
            </h2>

            <p>
              Discover places serving your next favorite meal.
            </p>
          </div>

          <Link
            to="/restaurants"
            className="restaurants-view-all"
          >
            Explore all <FiArrowRight size={17} />
          </Link>
        </motion.div>

        {loading && (
          <div className="popular-restaurants-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <RestaurantSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="restaurants-message">
            <span className="restaurants-message-emoji">🍽️</span>
            <h3>Restaurants are taking a break</h3>
            <p>{error}</p>

            <button type="button" onClick={fetchRestaurants}>
              <FiRefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="restaurants-message">
            <span className="restaurants-message-emoji">🍜</span>
            <h3>More delicious choices coming soon!</h3>
            <p>
              There are no active restaurants to show right now.
            </p>
            <Link to="/restaurants">Explore restaurants</Link>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <motion.div
            className="popular-restaurants-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {restaurants.slice(0, 8).map((restaurant) => {
              const image = getRestaurantImage(restaurant);
              const cuisines = Array.isArray(restaurant.cuisines)
                ? restaurant.cuisines
                : [];

              return (
                <motion.article
                  key={restaurant._id || restaurant.id}
                  className="restaurant-card"
                  variants={cardVariants}
                  whileHover={{ y: -7 }}
                  transition={{ duration: 0.22 }}
                >
                  <Link
                    to={`/restaurants/${restaurant._id || restaurant.id}`}
                    className="restaurant-card-link"
                    aria-label={`View ${restaurant.name}`}
                  >
                    <div className="restaurant-image-wrapper">
                      {image ? (
                        <img
                          src={image}
                          alt={restaurant.name}
                          className="restaurant-image"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}

                      {!image && (
                        <div className="restaurant-image-placeholder">
                          🍽️
                        </div>
                      )}

                      <span className="restaurant-image-overlay" />

                      <span
                        className={`restaurant-status ${
                          restaurant.isOpen === false
                            ? "restaurant-closed"
                            : "restaurant-open"
                        }`}
                      >
                        <span />
                        {restaurant.isOpen === false
                          ? "Currently closed"
                          : "Available"}
                      </span>

                      <span className="restaurant-image-label">
                        <FiMapPin size={13} />
                        FoodieGo favorite
                      </span>
                    </div>

                    <div className="restaurant-card-body">
                      <div className="restaurant-name-row">
                        <h3>{restaurant.name}</h3>

                        <span className="restaurant-rating">
                          <FiStar size={13} fill="currentColor" />
                          {Number.isFinite(Number(restaurant.rating))
                            ? Number(restaurant.rating).toFixed(1)
                            : "New"}
                        </span>
                      </div>

                      <p className="restaurant-description">
                        {restaurant.description ||
                          "Discover delicious dishes and local favorites."}
                      </p>

                      <div className="restaurant-cuisines">
                        {cuisines.length > 0 ? (
                          cuisines.slice(0, 3).map((cuisine) => (
                            <span key={cuisine}>{cuisine}</span>
                          ))
                        ) : (
                          <span>Various cuisines</span>
                        )}
                      </div>

                      <div className="restaurant-card-divider" />

                      <div className="restaurant-meta">
                        <span>
                          <FiClock size={15} />
                          {restaurant.deliveryTime || "30–45 min"}
                        </span>

                        <span>
                          <FiTruck size={15} />
                          {Number(restaurant.deliveryFee) === 0
                            ? "Free delivery"
                            : restaurant.deliveryFee != null
                              ? `₹${restaurant.deliveryFee} delivery`
                              : "Delivery available"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/restaurants/${restaurant._id || restaurant.id}`}
                    className="restaurant-card-action"
                  >
                    View restaurant <FiArrowRight size={15} />
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        <div className="restaurants-bottom-cta">
          <span>😋</span>
          <p>Hungry for more? Find your next favorite spot.</p>
          <Link to="/restaurants">
            Browse restaurants <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PopularRestaurants;
