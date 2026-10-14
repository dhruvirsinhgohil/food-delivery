
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCopy,
  FiTruck,
  FiPercent,
  FiGift,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "../../styles/SpecialOffers.css";

const offers = [
  {
    id: 1,
    tag: "FIRST ORDER",
    title: "Hungry? Save Big!",
    description:
      "Get 30% off your first order and enjoy your favorite meals for less.",
    code: "WELCOME30",
    discount: "30%",
    icon: <FiPercent />,
    className: "offer-orange",
    minimum: "On orders above ₹199",
  },
  {
    id: 2,
    tag: "FREE DELIVERY",
    title: "Good Food, Zero Fees",
    description:
      "Enjoy free delivery on your next delicious meal from selected restaurants.",
    code: "FREEDEL",
    discount: "₹0",
    icon: <FiTruck />,
    className: "offer-green",
    minimum: "On orders above ₹299",
  },
  {
    id: 3,
    tag: "WEEKEND SPECIAL",
    title: "More Food, More Fun",
    description:
      "Make your weekend tastier with exciting savings on your favorite dishes.",
    code: "WEEKEND20",
    discount: "20%",
    icon: <FiGift />,
    className: "offer-purple",
    minimum: "On orders above ₹249",
  },
];

function SpecialOffers() {
  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      Swal.fire({
        icon: "success",
        title: "Coupon copied!",
        text: `${code} has been copied.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        title: "Your coupon code",
        text: code,
        confirmButtonColor: "#f97316",
      });
    }
  };

  return (
    <section className="special-offers-section">
      <div className="special-offers-container">
        <motion.div
          className="special-offers-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="offers-eyebrow">DELICIOUS DEALS</span>
            <h2>
              Special offers for <span>you!</span>
            </h2>
            <p>
              Great food tastes even better when you save money.
            </p>
          </div>
        </motion.div>

        <div className="special-offers-grid">
          {offers.map((offer, index) => (
            <motion.article
              key={offer.id}
              className={`special-offer-card ${offer.className}`}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
              }}
              whileHover={{ y: -7 }}
            >
              <div className="offer-card-top">
                <span className="offer-tag">{offer.tag}</span>
                <div className="offer-icon">{offer.icon}</div>
              </div>

              <div className="offer-discount">{offer.discount}</div>

              <h3>{offer.title}</h3>
              <p className="offer-description">{offer.description}</p>

              <span className="offer-minimum">{offer.minimum}</span>

              <div className="offer-coupon-row">
                <div className="offer-coupon-code">
                  <span>CODE</span>
                  <strong>{offer.code}</strong>
                </div>

                <button
                  type="button"
                  className="offer-copy-button"
                  onClick={() => copyCoupon(offer.code)}
                  aria-label={`Copy coupon ${offer.code}`}
                >
                  <FiCopy />
                </button>
              </div>

              <Link to="/restaurants" className="offer-shop-link">
                Order now <FiArrowRight />
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="offers-bottom-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span>🍔</span>
          <p>
            Your next favorite meal is just a few clicks away.
          </p>
          <Link to="/restaurants">Explore restaurants →</Link>
        </motion.div>
      </div>
    </section>
  );
}

export default SpecialOffers;
