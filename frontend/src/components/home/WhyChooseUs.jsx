
import React from "react";
import '../../styles/WhyChooseUs.css';

const features = [
  {
    id: 1,
    icon: "⚡",
    title: "Lightning-Fast Delivery",
    description:
      "Get your favorite meals delivered quickly and fresh to your doorstep.",
    color: "orange",
  },
  {
    id: 2,
    icon: "🥗",
    title: "Fresh & Quality Food",
    description:
      "Enjoy delicious meals prepared with care using quality ingredients.",
    color: "green",
  },
  {
    id: 3,
    icon: "💳",
    title: "Easy & Secure Checkout",
    description:
      "Order in just a few clicks with a simple and convenient checkout.",
    color: "blue",
  },
  {
    id: 4,
    icon: "🎁",
    title: "Amazing Deals & Offers",
    description:
      "Save more on your favorite dishes with exciting discounts and deals.",
    color: "purple",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-decoration why-decoration-one" />
      <div className="why-decoration why-decoration-two" />

      <div className="why-container">
        <div className="why-heading">
          <span className="why-badge">
            <span className="why-badge-dot" />
            THE FOODIEGO DIFFERENCE
          </span>

          <h2>
            Why Everyone Loves <span>FoodieGo</span>
          </h2>

          <p>
            Great food, great prices, and a great experience.
            We make satisfying your cravings easier than ever.
          </p>
        </div>

        <div className="why-grid">
          {features.map((feature, index) => (
            <article
              className={`why-card why-card-${feature.color}`}
              key={feature.id}
              style={{ "--card-index": index }}
            >
              <span className="why-number">
                {String(feature.id).padStart(2, "0")}
              </span>

              <div className="why-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <div className="why-card-line" />
            </article>
          ))}
        </div>

        <div className="why-banner">
          <div className="why-banner-decoration" />

          <div className="why-banner-content">
            <span>GOOD FOOD. GOOD MOOD.</span>

            <h3>Your next favorite meal is waiting!</h3>

            <p>
              Explore delicious dishes and discover something
              you'll love today.
            </p>
          </div>

          <a href="/restaurants" className="why-banner-button">
            Explore Restaurants <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
