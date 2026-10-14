
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FiArrowRight,
  FiChevronRight,
} from "react-icons/fi";

import "../../styles/Categories.css";

const categories = [
  {
    id: "all",
    name: "All Foods",
    emoji: "🍽️",
    description: "Explore everything",
    color: "#fff0df",
    accent: "#f97316",
  },
  {
    id: "pizza",
    name: "Pizza",
    emoji: "🍕",
    description: "Cheesy & delicious",
    color: "#ffeddf",
    accent: "#ea580c",
  },
  {
    id: "burger",
    name: "Burgers",
    emoji: "🍔",
    description: "Juicy & satisfying",
    color: "#fff0d9",
    accent: "#d97706",
  },
  {
    id: "indian",
    name: "Indian",
    emoji: "🍛",
    description: "Authentic flavors",
    color: "#ffe8df",
    accent: "#e85d04",
  },
  {
    id: "biryani",
    name: "Biryani",
    emoji: "🍚",
    description: "Aromatic favorites",
    color: "#fff0d7",
    accent: "#ca8a04",
  },
  {
    id: "desserts",
    name: "Desserts",
    emoji: "🍰",
    description: "Sweet little treats",
    color: "#ffe8f0",
    accent: "#e64980",
  },
  {
    id: "drinks",
    name: "Drinks",
    emoji: "🥤",
    description: "Cool & refreshing",
    color: "#e4f4ff",
    accent: "#0284c7",
  },
  {
    id: "healthy",
    name: "Healthy",
    emoji: "🥗",
    description: "Fresh & balanced",
    color: "#e6f7e8",
    accent: "#16a34a",
  },
];

function Categories() {
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);

    if (category.id === "all") {
      navigate("/restaurants");
    } else {
      navigate(
        `/restaurants?category=${encodeURIComponent(category.id)}`
      );
    }
  };

  return (
    <section className="categories-section">
      <div className="categories-container">
        {/* Section heading */}
        <motion.div
          className="categories-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="categories-eyebrow">
              <span className="categories-eyebrow-dot" />
              WHAT ARE YOU CRAVING?
            </span>

            <h2>
              Explore by{" "}
              <span className="categories-gradient">
                category
              </span>
            </h2>

            <p>
              Discover your favorite flavors, all in one place.
            </p>
          </div>

          <motion.button
            type="button"
            className="categories-view-all"
            onClick={() => navigate("/restaurants")}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.96 }}
          >
            View all <FiArrowRight size={17} />
          </motion.button>
        </motion.div>

        {/* Category cards */}
        <motion.div
          className="categories-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.075,
              },
            },
          }}
        >
          {categories.map((category, index) => {
            const isActive = activeCategory === category.id;

            return (
              <motion.button
                type="button"
                key={category.id}
                className={`category-card ${
                  isActive ? "category-active" : ""
                }`}
                style={{
                  "--category-color": category.color,
                  "--category-accent": category.accent,
                }}
                onClick={() => handleCategoryClick(category)}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 25,
                    scale: 0.96,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.45,
                      ease: "easeOut",
                    },
                  },
                }}
                whileHover={{
                  y: -7,
                  scale: 1.025,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={isActive}
              >
                {/* Active border indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      className="category-active-indicator"
                      layoutId="category-active-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <span className="category-card-top">
                  <span className="category-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="category-arrow">
                    <FiChevronRight size={16} />
                  </span>
                </span>

                <motion.span
                  className="category-emoji-wrap"
                  whileHover={{
                    rotate: [-5, 5, -3, 0],
                    scale: 1.12,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="category-emoji">
                    {category.emoji}
                  </span>
                </motion.span>

                <span className="category-card-content">
                  <span className="category-name">
                    {category.name}
                  </span>

                  <span className="category-description">
                    {category.description}
                  </span>
                </span>

                <span className="category-card-bottom">
                  <span
                    className="category-explore"
                    style={{ color: category.accent }}
                  >
                    Explore
                  </span>

                  <span
                    className="category-bottom-arrow"
                    style={{ backgroundColor: category.color }}
                  >
                    <FiArrowRight size={15} />
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bottom message */}
        <motion.div
          className="categories-bottom-note"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="categories-note-emoji">😋</span>

          <p>
            Can't decide? Your next favorite meal is just a click away.
          </p>

          <button
            type="button"
            onClick={() => navigate("/restaurants")}
          >
            Discover more <FiArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Categories;
