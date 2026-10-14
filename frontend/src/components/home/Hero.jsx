
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiSearch,
  FiMapPin,
  FiClock,
  FiShield,
  FiStar,
} from "react-icons/fi";

import "../../styles/Home.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function Hero() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/restaurants?search=${encodeURIComponent(query)}`
        : "/restaurants"
    );
  };

  return (
    <section className="hero-section">
      <div className="hero-background-orb hero-orb-one" />
      <div className="hero-background-orb hero-orb-two" />

      <div className="hero-container">
        {/* Left content */}
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={itemVariants}>
            <span className="hero-badge-dot" />
            GOOD FOOD. GREAT MOOD.
            <span className="hero-badge-emoji">✨</span>
          </motion.div>

          <motion.h1 variants={itemVariants}>
            Cravings?
            <br />
            <span className="hero-gradient-text">We've got</span>
            <br />
            <span className="hero-heading-last">
              you covered.
            </span>
          </motion.h1>

          <motion.p
            className="hero-description"
            variants={itemVariants}
          >
            Discover amazing restaurants, explore delicious dishes,
            and get your favorites delivered right to your door.
          </motion.p>

          <motion.form
            className="hero-search"
            onSubmit={handleSearch}
            variants={itemVariants}
          >
            <FiSearch className="hero-search-icon" size={21} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pizza, burger, biryani..."
              aria-label="Search for food"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Search restaurants"
            >
              Find Food <FiArrowRight size={18} />
            </motion.button>
          </motion.form>

          <motion.div
            className="hero-buttons"
            variants={itemVariants}
          >
            <Link to="/restaurants" className="hero-primary-link">
              Explore Restaurants <FiArrowRight size={18} />
            </Link>

            <Link to="/orders" className="hero-secondary-link">
              Track Orders
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="hero-features"
            variants={itemVariants}
          >
            <div className="hero-feature">
              <span className="hero-feature-icon orange-feature">
                <FiClock size={20} />
              </span>

              <span>
                <strong>Fast Delivery</strong>
                <small>Quick and convenient</small>
              </span>
            </div>

            <div className="hero-feature">
              <span className="hero-feature-icon green-feature">
                <FiShield size={20} />
              </span>

              <span>
                <strong>Safe & Secure</strong>
                <small>Easy, secure checkout</small>
              </span>
            </div>

            <div className="hero-feature">
              <span className="hero-feature-icon pink-feature">
                <FiStar size={20} />
              </span>

              <span>
                <strong>Great Choices</strong>
                <small>Explore local favorites</small>
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right food illustration made with CSS and emoji */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.86, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.25,
            ease: "easeOut",
          }}
        >
          <motion.div
            className="hero-food-circle"
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="hero-food-glow" />
            <span className="hero-food-emoji" role="img" aria-label="Burger">
              🍔
            </span>
            <span className="hero-food-fries" role="img" aria-label="Fries">
              🍟
            </span>
            <span className="hero-food-pizza" role="img" aria-label="Pizza">
              🍕
            </span>
          </motion.div>

          <motion.div
            className="hero-floating-card hero-rating-card"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="floating-card-icon">⭐</span>
            <span>
              <strong>Delicious choices</strong>
              <small>Something for every craving</small>
            </span>
          </motion.div>

          <motion.div
            className="hero-floating-card hero-delivery-card"
            animate={{ y: [0, 7, 0] }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="floating-card-icon delivery-emoji">🛵</span>
            <span>
              <strong>At your doorstep</strong>
              <small>Order your favorites today</small>
            </span>
          </motion.div>

          <div className="hero-location-tag">
            <FiMapPin size={15} />
            Deliciousness is nearby
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
