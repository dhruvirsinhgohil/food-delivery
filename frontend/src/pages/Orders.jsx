import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiClock, FiPackage, FiRefreshCw } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import "../styles/Commerce.css";

const statusLabel = (status = "placed") => status.replaceAll("_", " ");
const itemName = (item) => item.foodName || item.food?.name || "Food item";

function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingOrder, setReviewingOrder] = useState("");
  const [review, setReview] = useState({ rating: "5", comment: "" });
  const [reviewNotice, setReviewNotice] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const placedNumber = searchParams.get("placed");

  const loadOrders = () => {
    api.get("/orders/my-orders")
      .then(({ data }) => setOrders(data.orders || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: "/orders" }} replace />;

  const cancelOrder = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    setError("");
    try {
      await api.patch(`/orders/${order._id}/cancel`, { reason: "Cancelled by customer" });
      loadOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "This order could not be cancelled.");
    }
  };

  const submitReview = async (order) => {
    setError("");
    setReviewNotice("");
    try {
      await api.post("/reviews", {
        restaurant: order.restaurant?._id || order.restaurant,
        order: order._id,
        rating: Number(review.rating),
        comment: review.comment,
      });
      setReviewingOrder("");
      setReview({ rating: "5", comment: "" });
      setReviewNotice(`Thanks for reviewing order ${order.orderNumber}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit your review.");
    }
  };

  return (
    <main className="commerce-page">
      <div className="commerce-page-heading"><div><span className="commerce-kicker">YOUR FOOD JOURNEY</span><h1>My orders</h1><p>All your recent meals, in one place.</p></div><Link to="/restaurants" className="commerce-button outline">Order something tasty <FiArrowRight /></Link></div>
      {placedNumber && <div className="commerce-alert success">Your order <strong>{placedNumber}</strong> is placed. We’re getting it ready!<button type="button" onClick={() => setSearchParams({})} aria-label="Dismiss">×</button></div>}
      {error && <div className="commerce-alert error" role="alert">{error}</div>}
      {reviewNotice && <div className="commerce-alert success" role="status">{reviewNotice}</div>}
      {loading ? <div className="commerce-loading"><span className="commerce-spinner" /> Loading your orders…</div> : orders.length ? <div className="orders-list">
        {orders.map((order) => <article className="order-card" key={order._id}>
          <div className="order-card-top"><div><span className="order-number">{order.orderNumber}</span><span className={`order-status status-${order.orderStatus}`}>{statusLabel(order.orderStatus)}</span></div><span className="order-date"><FiClock /> {new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span></div>
          <div className="order-card-content"><div className="order-restaurant"><span className="order-restaurant-icon"><FiPackage /></span><div><strong>{order.restaurant?.name || "Restaurant"}</strong><span>{(order.items || []).map((item) => `${item.quantity} × ${itemName(item)}`).join(" · ")}</span></div></div><div className="order-price"><strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong><span>{order.paymentStatus === "paid" ? "Paid" : "Payment pending"} · {order.paymentMethod?.toUpperCase()}</span></div></div>
          {order.address && <p className="order-delivery-address">Delivering to {order.address.street}, {order.address.city} {order.address.pincode}</p>}
          <div className="order-card-actions"><span>Order status: <strong>{statusLabel(order.orderStatus)}</strong></span>{!["delivered", "cancelled", "out_for_delivery"].includes(order.orderStatus) && <button type="button" className="commerce-text-link danger-link" onClick={() => cancelOrder(order)}>Cancel order</button>}</div>
          {order.orderStatus === "delivered" && <div className="order-review">
            {reviewingOrder === order._id ? <form onSubmit={(event) => { event.preventDefault(); submitReview(order); }}>
              <label>Rate this order <select value={review.rating} onChange={(event) => setReview({ ...review, rating: event.target.value })}><option value="5">★★★★★ — Loved it</option><option value="4">★★★★ — Great</option><option value="3">★★★ — Good</option><option value="2">★★ — Could be better</option><option value="1">★ — Disappointed</option></select></label>
              <textarea value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} placeholder="Share a few words about your meal (optional)" maxLength="500" />
              <div className="commerce-button-row"><button className="commerce-button primary" type="submit">Submit review</button><button className="commerce-button subtle" type="button" onClick={() => setReviewingOrder("")}>Cancel</button></div>
            </form> : <button className="commerce-text-link" type="button" onClick={() => setReviewingOrder(order._id)}>Rate your meal ★</button>}
          </div>}
        </article>)}
      </div> : <section className="commerce-empty"><span>🍲</span><h2>No orders yet</h2><p>When you place an order, you’ll find the details right here.</p><Link className="commerce-button primary" to="/restaurants">Explore restaurants</Link></section>}
      {!loading && orders.length > 0 && <button className="commerce-button subtle refresh-orders" type="button" onClick={loadOrders}><FiRefreshCw /> Refresh orders</button>}
    </main>
  );
}

export default Orders;
