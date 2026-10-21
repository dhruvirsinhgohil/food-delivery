
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiArrowRight,
  FiHeart,
  FiCheckCircle,
} from "react-icons/fi";
import "../../styles/Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage(
      "Thanks for your interest! Newsletter subscription needs backend integration."
    );
    setEmail("");
  };

  return (
    <footer className="foodiego-footer">
      <div className="footer-container">
        <motion.div
          className="footer-newsletter"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="newsletter-content">
            <span className="newsletter-label">STAY IN THE LOOP</span>
            <h2>
              Delicious deals, <span>straight to you.</span>
            </h2>
            <p>
              Subscribe for food updates, special offers, and exciting
              announcements from FoodieGo.
            </p>
          </div>

          <form
            className="newsletter-form"
            onSubmit={handleSubscribe}
          >
            <div className="newsletter-input-wrap">
              <FiMail />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
                required
                aria-label="Email address"
              />

              <button type="submit" aria-label="Subscribe">
                <FiArrowRight />
              </button>
            </div>

            {message && (
              <p className="newsletter-message" role="status">
                {message}
              </p>
            )}

            <span className="newsletter-privacy">
              No spam. Just something delicious.
            </span>
          </form>
        </motion.div>

        <div className="footer-main">
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand">
              <span className="footer-logo">🍔</span>
              <span>
                Foodie<span>Go</span>
              </span>
            </Link>

            <p className="footer-brand-description">
              Your cravings, our mission. Discover delicious meals from
              restaurants around you and make every bite count.
            </p>

            <div className="footer-socials">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FiTwitter />
              </a>
            </div>
          </div>

          <div className="footer-links-column">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/foods">Browse Food</Link>
            <Link to="/restaurants">Restaurants</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">My Wishlist</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>

          <div className="footer-links-column">
            <h3>Account</h3>
            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/account">My Profile</Link>
            <Link to="/orders">Order History</Link>
          </div>

          <div className="footer-contact-column">
            <h3>Get in Touch</h3>

            <div className="footer-contact-item">
              <FiMapPin />
              <span>Gujarat, India</span>
            </div>

            <a
              className="footer-contact-item"
              href="mailto:support@foodiego.example"
            >
              <FiMail />
              <span>Customer support</span>
            </a>

            <div className="footer-contact-item">
              <FiPhone />
              <span>Contact details coming soon</span>
            </div>

            <div className="footer-support-note">
              <FiCheckCircle />
              <span>Here to help with your food journey</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} FoodieGo. All rights reserved.
          </p>

          <div className="footer-legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>

          <p className="footer-made-with">
            Made with <FiHeart /> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
