
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import api from "../api/axios";
import {
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiRefreshCw,
  FiSliders,
} from "react-icons/fi";
import RestaurantCard from "../components/RestaurantCard";
import "../styles/Restaurants.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/restaurants");
      const payload = response.data;

      const restaurantList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.restaurants)
          ? payload.restaurants
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.restaurants)
              ? payload.data.restaurants
              : [];

      setRestaurants(
        restaurantList.filter(
          (restaurant) => restaurant.isActive !== false
        )
      );
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      setError(
        "Unable to load restaurants. Please check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchRestaurants);
  }, []);

  const cuisines = useMemo(() => {
    const allCuisines = restaurants.flatMap((restaurant) => {
      const value = restaurant.cuisines || restaurant.cuisine || [];

      return Array.isArray(value) ? value : [value];
    });

    return ["All", ...new Set(allCuisines.filter(Boolean))];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants.filter((restaurant) => {
      const name = restaurant.name || "";
      const description = restaurant.description || "";
      const cuisineValue =
        restaurant.cuisines || restaurant.cuisine || [];
      const cuisineList = Array.isArray(cuisineValue)
        ? cuisineValue
        : [cuisineValue];

      const matchesSearch = `${name} ${description} ${cuisineList.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCuisine =
        selectedCuisine === "All" ||
        cuisineList.includes(selectedCuisine);

      return matchesSearch && matchesCuisine;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } else if (sortBy === "deliveryFee") {
      result = [...result].sort(
        (a, b) =>
          Number(a.deliveryFee || 0) -
          Number(b.deliveryFee || 0)
      );
    } else if (sortBy === "deliveryTime") {
      result = [...result].sort(
        (a, b) =>
          parseInt(a.deliveryTime, 10) -
          parseInt(b.deliveryTime, 10)
      );
    }

    return result;
  }, [restaurants, search, selectedCuisine, sortBy]);

  return (
    <main className="restaurants-page">
      <section className="restaurants-hero">
        <div className="restaurants-hero-content">
          <motion.span
            className="restaurants-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            GOOD FOOD, GREAT MOOD
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Discover your next
            <span> favourite meal.</span>
          </motion.h1>

          <p>
            Explore local restaurants and get delicious food
            delivered straight to your door.
          </p>

          <div className="restaurants-location">
            <FiMapPin />
            <span>Fresh food delivered to your location</span>
          </div>

          <div className="restaurants-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="restaurants-content">
        <div className="restaurants-heading">
          <div>
            <span className="restaurants-section-label">
              EXPLORE FOOD
            </span>
            <h2>Restaurants near you</h2>
            <p>Find something delicious for every craving.</p>
          </div>

          <div className="restaurants-count">
            {filteredRestaurants.length} restaurants
          </div>
        </div>

        <div className="restaurants-toolbar">
          <div className="cuisine-filters">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                className={
                  selectedCuisine === cuisine ? "active" : ""
                }
                onClick={() => setSelectedCuisine(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>

          <label className="restaurants-sort">
            <FiSliders />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="name">Name</option>
              <option value="deliveryFee">Lowest delivery fee</option>
              <option value="deliveryTime">Fastest delivery</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="restaurants-message">
            <div className="restaurants-loader" />
            <h3>Finding delicious places...</h3>
            <p>Loading restaurants for you.</p>
          </div>
        ) : error ? (
          <div className="restaurants-message">
            <h3>Oops! Something went wrong.</h3>
            <p>{error}</p>
            <button
              type="button"
              className="restaurants-retry"
              onClick={fetchRestaurants}
            >
              <FiRefreshCw /> Try again
            </button>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="restaurants-message">
            <div className="restaurants-empty-icon">🍽️</div>
            <h3>No restaurants found</h3>
            <p>Try another search or choose a different cuisine.</p>
            <button
              type="button"
              className="restaurants-retry"
              onClick={() => {
                setSearch("");
                setSelectedCuisine("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id || restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </section>

      <section className="restaurants-bottom-banner">
        <div>
          <span>YOUR NEXT FAVOURITE IS WAITING</span>
          <h2>Good food makes every day better.</h2>
          <p>Explore our restaurants and find your next meal.</p>
        </div>

        <Link to="/" className="restaurants-home-link">
          Explore FoodieGo <FiArrowRight />
        </Link>
      </section>
    </main>
  );
}

export default Restaurants;
