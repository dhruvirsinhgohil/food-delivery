import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiCheck, FiMapPin, FiPlus, FiTag, FiTruck } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import "../styles/Commerce.css";

const emptyAddress = { addressType: "home", fullName: "", phone: "", street: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };
const errorMessage = (error) => error.response?.data?.message || error.message || "Something went wrong. Please try again.";

function Checkout() {
  const { isAuthenticated } = useAuth();
  const { cartItems, totalPrice, clearCart, refreshCart, loading } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/addresses").then(({ data }) => {
      setAddresses(data.addresses || []);
      setSelectedAddress(data.addresses?.find((address) => address.isDefault)?._id || data.addresses?.[0]?._id || "");
      if (!data.addresses?.length) setFormOpen(true);
    }).catch((requestError) => setError(errorMessage(requestError)));
  }, [isAuthenticated]);

  const deliveryFee = cartItems.length ? 40 : 0;
  const tax = Number((totalPrice * 0.05).toFixed(2));
  const discount = useMemo(() => {
    if (!coupon) return 0;
    const value = coupon.discountType === "percentage" ? totalPrice * coupon.discountValue / 100 : coupon.discountValue;
    return Math.min(totalPrice, coupon.maximumDiscount ? Math.min(value, coupon.maximumDiscount) : value);
  }, [coupon, totalPrice]);
  const total = Math.max(0, totalPrice + deliveryFee + tax - discount);
  const mixedRestaurants = new Set(cartItems.map((item) => item.restaurant)).size > 1;

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  if (loading) return <main className="commerce-page"><div className="commerce-loading"><span className="commerce-spinner" /> Syncing your cart…</div></main>;
  if (!cartItems.length) return <main className="commerce-page"><section className="commerce-empty"><span>🛍️</span><h1>Your cart is empty</h1><p>Add a few dishes before checking out.</p><Link className="commerce-button primary" to="/restaurants">Explore restaurants</Link></section></main>;

  const saveAddress = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/addresses", addressForm);
      const next = addressForm.isDefault ? [data.address, ...addresses.map((address) => ({ ...address, isDefault: false }))] : [...addresses, data.address];
      setAddresses(next);
      setSelectedAddress(data.address._id);
      setAddressForm(emptyAddress);
      setFormOpen(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const applyCoupon = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.get(`/coupons/code/${encodeURIComponent(couponInput.trim())}`);
      if (totalPrice < Number(data.coupon.minimumOrderAmount || 0)) {
        throw new Error(`This coupon requires a minimum subtotal of ₹${data.coupon.minimumOrderAmount}.`);
      }
      setCoupon(data.coupon);
    } catch (requestError) {
      setCoupon(null);
      setError(errorMessage(requestError));
    }
  };

  const placeOrder = async () => {
    setError("");
    if (!selectedAddress) return setError("Choose or add a delivery address.");
    if (mixedRestaurants) return setError("Orders can only contain items from one restaurant. Please update your cart.");
    setBusy(true);
    try {
      const { data } = await api.post("/orders", { address: selectedAddress, couponCode: coupon?.code || undefined, paymentMethod });
      if (paymentMethod !== "cod") {
        await api.post("/payments", { orderId: data.order._id, method: paymentMethod });
      }
      await clearCart();
      await refreshCart();
      navigate(`/orders?placed=${encodeURIComponent(data.order.orderNumber)}`, { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="commerce-page checkout-page">
      <div className="commerce-page-heading"><div><span className="commerce-kicker">ALMOST THERE</span><h1>Checkout</h1><p>Confirm your delivery details and make this meal yours.</p></div><Link to="/cart" className="commerce-text-link">← Back to cart</Link></div>
      {error && <div className="commerce-alert error" role="alert">{error}</div>}
      {mixedRestaurants && <div className="commerce-alert warning">Your cart includes more than one restaurant. A single order must come from one restaurant.</div>}
      <div className="checkout-grid">
        <div className="checkout-main">
          <section className="commerce-panel">
            <div className="commerce-panel-heading"><span className="commerce-step">01</span><div><h2>Delivery address</h2><p>Where should we bring your food?</p></div></div>
            <div className="address-list">
              {addresses.map((address) => <label className={`address-card ${selectedAddress === address._id ? "selected" : ""}`} key={address._id}>
                <input type="radio" name="address" value={address._id} checked={selectedAddress === address._id} onChange={() => setSelectedAddress(address._id)} />
                <FiMapPin className="address-icon" />
                <span><strong>{address.fullName} <small>{address.addressType}</small></strong><span>{address.street}{address.landmark ? `, ${address.landmark}` : ""}, {address.city}, {address.state} {address.pincode}</span><span>{address.phone}</span></span>
                {selectedAddress === address._id && <FiCheck className="address-check" />}
              </label>)}
            </div>
            {!formOpen && <button className="commerce-button outline" type="button" onClick={() => setFormOpen(true)}><FiPlus /> Add a new address</button>}
            {formOpen && <form className="address-form commerce-form" onSubmit={saveAddress}>
              <div className="commerce-form-grid">
                <label><span>Full name</span><input required value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} /></label>
                <label><span>Phone number</span><input required type="tel" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} /></label>
                <label className="wide"><span>Street address</span><input required value={addressForm.street} onChange={(event) => setAddressForm({ ...addressForm, street: event.target.value })} /></label>
                <label className="wide"><span>Landmark <small>(optional)</small></span><input value={addressForm.landmark} onChange={(event) => setAddressForm({ ...addressForm, landmark: event.target.value })} /></label>
                <label><span>City</span><input required value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} /></label>
                <label><span>State</span><input required value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} /></label>
                <label><span>PIN code</span><input required value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value })} /></label>
                <label><span>Address type</span><select value={addressForm.addressType} onChange={(event) => setAddressForm({ ...addressForm, addressType: event.target.value })}><option value="home">Home</option><option value="office">Office</option><option value="other">Other</option></select></label>
              </div>
              <label className="commerce-checkbox"><input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm({ ...addressForm, isDefault: event.target.checked })} /> Set as my default address</label>
              <div className="commerce-button-row"><button className="commerce-button primary" type="submit">Save address</button>{addresses.length > 0 && <button className="commerce-button subtle" type="button" onClick={() => setFormOpen(false)}>Cancel</button>}</div>
            </form>}
          </section>

          <section className="commerce-panel">
            <div className="commerce-panel-heading"><span className="commerce-step">02</span><div><h2>Payment method</h2><p>Choose how you’d like to pay.</p></div></div>
            <div className="payment-options">
              {[["cod", "Cash on delivery", "Pay when your food arrives"], ["upi", "UPI", "Simulated payment for demo purposes"], ["card", "Credit or debit card", "Simulated payment for demo purposes"]].map(([value, title, description]) => <label className={`payment-option ${paymentMethod === value ? "selected" : ""}`} key={value}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><span className="payment-radio" /><span><strong>{title}</strong><small>{description}</small></span></label>)}
            </div>
            {paymentMethod !== "cod" && <p className="commerce-note">Online payment is simulated by this project’s demo gateway. No real payment details are collected.</p>}
          </section>
        </div>
        <aside className="commerce-panel checkout-summary">
          <h2>Your order</h2><p className="checkout-summary-intro"><FiTruck /> Delivered fresh to your door</p>
          {cartItems.map((item) => <div className="checkout-line item-line" key={item._id}><span>{item.quantity} × {item.name}</span><strong>₹{(item.price * item.quantity).toFixed(2)}</strong></div>)}
          <div className="commerce-divider" />
          <div className="checkout-line"><span>Subtotal</span><strong>₹{totalPrice.toFixed(2)}</strong></div>
          <div className="checkout-line"><span>Delivery fee</span><strong>₹{deliveryFee.toFixed(2)}</strong></div>
          <div className="checkout-line"><span>Taxes</span><strong>₹{tax.toFixed(2)}</strong></div>
          {coupon && <div className="checkout-line discount-line"><span>Coupon ({coupon.code})</span><strong>−₹{discount.toFixed(2)}</strong></div>}
          <form className="coupon-form" onSubmit={applyCoupon}><FiTag /><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Coupon code" aria-label="Coupon code" /><button type="submit">Apply</button></form>
          {coupon && <button className="commerce-text-link remove-coupon" type="button" onClick={() => setCoupon(null)}>Remove coupon</button>}
          <div className="checkout-total"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
          <button className="commerce-button primary full" type="button" disabled={busy || !addresses.length || mixedRestaurants} onClick={placeOrder}>{busy ? "Placing order…" : `Place order · ₹${total.toFixed(2)}`}</button>
          {!addresses.length && <p className="checkout-hint">Add a delivery address to continue.</p>}
          <p className="checkout-secure">🔒 Your details are used only to process this order.</p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
