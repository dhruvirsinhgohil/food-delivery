import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiHeart,
  FiPackage,
  FiHome,
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

import "../../styles/Navbar.css";

const navItems = [
  { name: "Home", path: "/", icon: FiHome },
  { name: "Restaurants", path: "/restaurants", icon: FiPackage },
  { name: "Orders", path: "/orders", icon: FiShoppingCart },
  { name: "Wishlist", path: "/wishlist", icon: FiHeart },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locationText, setLocationText] = useState("Your Location");

  const location = useLocation();
  const navigate = useNavigate();

  // Close the drawer when the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent the page from scrolling behind the drawer.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the drawer with the Escape key.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/restaurants?search=${encodeURIComponent(query)}`
        : "/restaurants"
    );

    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="foodie-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link
            to="/"
            className="foodie-brand"
            aria-label="FoodieGo home"
          >
            <motion.span
              className="brand-emoji"
              whileHover={{ rotate: [-8, 8, -5, 0], scale: 1.12 }}
              transition={{ duration: 0.4 }}
            >
              🍔
            </motion.span>

            <span className="brand-text">
              Foodie<span>Go</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="foodie-active-pill"
                          className="active-nav-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      <motion.span
                        className="nav-link-content"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                        <span>{item.name}</span>
                      </motion.span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <FiSearch size={19} />

            <input
              type="search"
              placeholder="Search food or restaurants..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search food or restaurants"
            />

            <button type="submit" aria-label="Submit search">
              <FiArrowRight size={17} />
            </button>
          </form>

          {/* Delivery location */}
        
<motion.div
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.97 }}
>
  <button
    type="button"
    className="delivery-location"
    onClick={async () => {
      const result = await Swal.fire({
        title: "Where should we deliver?",
        html: `
          <div class="foodie-location-description">
            <span class="foodie-location-emoji">🍔</span>
            <p>Fresh food, delivered to your doorstep.</p>
          </div>
        `,
        input: "text",
        inputPlaceholder: "Enter your city or area...",
        inputValue:
          locationText === "Your Location" ? "" : locationText,
        confirmButtonText: "Save Location →",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#78716c",
        reverseButtons: true,
        allowOutsideClick: true,
        inputAttributes: {
          maxlength: 100,
          "aria-label": "Delivery location",
        },
        inputValidator: (value) => {
          if (!value?.trim()) {
            return "Please enter your delivery location!";
          }
        },
        showClass: {
          popup: "foodie-popup-show",
        },
        hideClass: {
          popup: "foodie-popup-hide",
        },
        customClass: {
          popup: "foodie-swal-popup",
          title: "foodie-swal-title",
          confirmButton: "foodie-swal-confirm",
          cancelButton: "foodie-swal-cancel",
          input: "foodie-swal-input",
        },
      });

      if (result.isConfirmed && result.value?.trim()) {
        const newLocation = result.value.trim();
        setLocationText(newLocation);

        await Swal.fire({
          icon: "success",
          title: "Location updated!",
          text: `We'll use ${newLocation} as your selected location.`,
          confirmButtonText: "Great!",
          confirmButtonColor: "#f97316",
          timer: 2200,
          timerProgressBar: true,
          showClass: {
            popup: "foodie-popup-show",
          },
          customClass: {
            popup: "foodie-swal-popup",
            title: "foodie-swal-title",
            confirmButton: "foodie-swal-confirm",
          },
        });
      }
    }}
  >
    <span className="location-icon">
      <FiMapPin size={20} />
    </span>

    <span className="location-copy">
      <small>Deliver to</small>
      <strong>{locationText}</strong>
    </span>
  </button>
</motion.div>


          {/* Desktop actions */}
          <div className="navbar-actions">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/wishlist"
                className="icon-action"
                aria-label="Wishlist"
              >
                <FiHeart size={21} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/cart"
                className="icon-action"
                aria-label="Shopping cart"
              >
                <FiShoppingCart size={21} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/login"
                className="account-action"
                aria-label="Login"
              >
                <FiUser size={21} />
              </Link>
            </motion.div>
          </div>

          {/* Mobile/tablet menu button */}
          <motion.button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            whileTap={{ scale: 0.88 }}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="foodie-mobile-menu"
          >
            <FiMenu size={25} />
          </motion.button>
        </div>
      </header>

      {/* Animated mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeMenu}
              aria-hidden="true"
            />

            <motion.aside
              id="foodie-mobile-menu"
              className="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 32,
              }}
            >
              {/* Drawer header */}
              <div className="mobile-menu-header">
                <Link
                  to="/"
                  className="foodie-brand"
                  onClick={closeMenu}
                >
                  <span className="brand-emoji">🍔</span>
                  <span className="brand-text">
                    Foodie<span>Go</span>
                  </span>
                </Link>

                <motion.button
                  type="button"
                  className="menu-close"
                  onClick={closeMenu}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  aria-label="Close navigation menu"
                >
                  <FiX size={22} />
                </motion.button>
              </div>

              {/* Search in drawer */}
              <form
                className="mobile-search"
                onSubmit={handleSearch}
              >
                <FiSearch size={19} />

                <input
                  type="search"
                  placeholder="Search food..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search food"
                />

                <button type="submit" aria-label="Search">
                  <FiArrowRight size={18} />
                </button>
              </form>

              {/* Guest profile */}
              <Link
                to="/login"
                className="mobile-profile"
                onClick={closeMenu}
              >
                <span className="profile-avatar">
                  <FiUser size={24} />
                </span>

                <span className="profile-copy">
                  <strong>Welcome to FoodieGo</strong>
                  <small>Login to manage your orders</small>
                </span>

                <FiChevronRight size={21} />
              </Link>

              {/* Animated drawer links */}
              <motion.nav
                className="mobile-menu-links"
                aria-label="Mobile navigation"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.065 },
                  },
                }}
              >
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.path}
                      variants={{
                        hidden: { opacity: 0, x: 24 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.24 }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `mobile-nav-link ${isActive ? "active" : ""}`
                        }
                      >
                        <span className="mobile-nav-label">
                          <Icon size={20} />
                          <span>{item.name}</span>
                        </span>

                        <FiChevronRight
                          className="mobile-nav-arrow"
                          size={19}
                        />
                      </NavLink>
                    </motion.div>
                  );
                })}

                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 24 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <NavLink
                    to="/cart"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="mobile-nav-label">
                      <FiShoppingCart size={20} />
                      <span>Cart</span>
                    </span>

                    <FiChevronRight
                      className="mobile-nav-arrow"
                      size={19}
                    />
                  </NavLink>
                </motion.div>
              </motion.nav>

              {/* Location */}
              <div className="mobile-location">
                <FiMapPin size={21} />

                <span>
                  <small>Delivery location</small>
                  <strong>{locationText}</strong>
                </span>
              </div>

              {/* Authentication buttons */}
              <div className="mobile-auth-actions">
                <Link
                  to="/login"
                  className="mobile-login-button"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="mobile-signup-button"
                  onClick={closeMenu}
                >
                  Create Account <FiArrowRight size={18} />
                </Link>
              </div>

              <p className="mobile-menu-footer">
                Made with ❤️ for food lovers
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
