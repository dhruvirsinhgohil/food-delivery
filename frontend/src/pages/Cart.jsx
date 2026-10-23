import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/useCart";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/Cart.css";

function Cart() {
  const [error, setError] = useState("");
  const {
    cartItems,
    loading,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const runAction = async (action) => {
    setError("");
    try {
      await action();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to update your cart.");
    }
  };

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">YOUR FOODIEGO ORDER</p>
          <h1>My Cart 🛒</h1>
          <p>Review your delicious choices before checkout.</p>
        </div>

        {cartItems.length > 0 && (
          <button className="cart-clear-btn" onClick={() => runAction(clearCart)}>
            Clear Cart
          </button>
        )}
      </div>
      {error && <div className="commerce-alert error" role="alert">{error}</div>}

      {loading ? (
        <div className="commerce-loading"><span className="commerce-spinner" /> Syncing your cart…</div>
      ) : cartItems.length === 0 ? (
        <section className="cart-empty">
          <span>🍔</span>
          <h2>Your cart is hungry!</h2>
          <p>Add your favorite dishes to get started.</p>
          <Link to="/restaurants" className="cart-primary-btn">
            Explore Restaurants
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            <p className="cart-items-count">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>

            {cartItems.map((item) => (
              <article className="cart-item" key={item._id}>
                <div className="cart-item-image">
                  {item.image ? (
                    <img
                      src={
                        getImageUrl(item.image)
                      }
                      alt={item.name}
                    />
                  ) : (
                    <span>🍽️</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.restaurantName}</p>
                  <strong>₹{Number(item.price) * item.quantity}</strong>

                  <div className="cart-quantity">
                    <button
                      onClick={() => runAction(() => decreaseQuantity(item._id))}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => runAction(() => increaseQuantity(item._id))}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="cart-remove-btn"
                  onClick={() => runAction(() => removeFromCart(item._id))}
                >
                  Remove
                </button>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Items ({totalItems})</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery fee</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cart-summary-total">
              <span>Subtotal</span>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>

            <Link to="/restaurants" className="cart-secondary-btn">
              + Add More Food
            </Link>

            <Link to="/checkout" className="cart-primary-btn">
              Proceed to Checkout →
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
