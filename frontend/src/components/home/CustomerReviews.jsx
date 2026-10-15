
import { motion } from "motion/react";
import { FiStar, FiMessageCircle } from "react-icons/fi";
import "../../styles/CustomerReviews.css";

const reviews = [
  {
    id: 1,
    name: "Aarav Patel",
    location: "Ahmedabad",
    initials: "AP",
    rating: 5,
    date: "Recently",
    text: "The food arrived fresh and hot. Ordering was simple, and the restaurant had excellent food quality!",
    color: "review-avatar-orange",
  },
  {
    id: 2,
    name: "Priya Shah",
    location: "Vadodara",
    initials: "PS",
    rating: 5,
    date: "Recently",
    text: "Beautiful experience! The menu was easy to explore, and I found so many delicious options.",
    color: "review-avatar-purple",
  },
  {
    id: 3,
    name: "Rahul Desai",
    location: "Rajkot",
    initials: "RD",
    rating: 4,
    date: "Recently",
    text: "Great variety of food and a smooth ordering experience. I would love to order again!",
    color: "review-avatar-green",
  },
];

function CustomerReviews() {
  return (
    <section className="customer-reviews-section">
      <div className="customer-reviews-container">
        <motion.div
          className="customer-reviews-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="reviews-eyebrow">LOVE FROM OUR CUSTOMERS</span>

          <h2>
            What people <span>say about us</span>
          </h2>

          <p>
            Every meal has a story. Here is what our customers think
            about their FoodieGo experience.
          </p>
        </motion.div>

        <div className="customer-reviews-grid">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              className="customer-review-card"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
              }}
              whileHover={{ y: -6 }}
            >
              <div className="review-card-top">
                <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <FiStar
                      key={starIndex}
                      className={
                        starIndex < review.rating ? "star-filled" : ""
                      }
                    />
                  ))}
                </div>

                <FiMessageCircle className="review-quote-icon" />
              </div>

              <p className="review-text">"{review.text}"</p>

              <div className="review-customer">
                <div className={`review-avatar ${review.color}`}>
                  {review.initials}
                </div>

                <div className="review-customer-info">
                  <h3>{review.name}</h3>
                  <span>{review.location}</span>
                </div>

                <span className="review-date">{review.date}</span>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="reviews-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="reviews-bottom-icon">💛</div>
          <p>
            Your feedback matters. Enjoyed your order? Share your
            experience with FoodieGo!
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default CustomerReviews;
