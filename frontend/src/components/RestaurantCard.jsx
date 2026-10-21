import { Link } from "react-router-dom";
import { FiClock, FiMapPin, FiArrowRight } from "react-icons/fi";
import "../styles/RestaurantCard.css";
function RestaurantCard({ restaurant }) {
  const imageUrl = restaurant.image
    ? restaurant.image.startsWith("http")
      ? restaurant.image
      : `http://localhost:5000${restaurant.image}`
    : null;
  const address = restaurant.address;
  const location =
    typeof address === "string"
      ? address
      : [address?.city, address?.state].filter(Boolean).join(", ") ||
        "Location available";

  return (
    <div className="restaurant-card">
      <div className="restaurant-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={restaurant.name} />
        ) : (
          <div className="restaurant-placeholder">🍽️</div>
        )}

        <span
          className={`restaurant-status ${
            restaurant.isOpen ? "open" : "closed"
          }`}
        >
          {restaurant.isOpen ? "Open Now" : "Closed"}
        </span>
      </div>

      <div className="restaurant-card-content">
        <h3>{restaurant.name}</h3>

        <p className="restaurant-description">
          {restaurant.description || "Delicious food, made fresh for you."}
        </p>

        <div className="restaurant-card-details">
          <span>
            <FiClock />
            {restaurant.deliveryTime || "30–40 min"}
          </span>

          <span>
            <FiMapPin />
            {location}
          </span>
        </div>

        {restaurant.cuisines && (
          <div className="restaurant-cuisines">
            {Array.isArray(restaurant.cuisines)
              ? restaurant.cuisines.join(" • ")
              : restaurant.cuisines}
          </div>
        )}

        <Link
          to={`/restaurants/${restaurant._id}`}
          className="restaurant-view-btn"
        >
          View Restaurant <FiArrowRight />
        </Link>
      </div>
    </div>
  );
}

export default RestaurantCard;