import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiLogOut, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import "../styles/Commerce.css";

const emptyAddress = { addressType: "home", fullName: "", phone: "", street: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };

function Account() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/addresses")
      .then(({ data }) => setAddresses(data.addresses || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load saved addresses."));
  }, [isAuthenticated]);
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  const addAddress = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/addresses", form);
      setAddresses((current) => form.isDefault ? [data.address, ...current.map((address) => ({ ...address, isDefault: false }))] : [...current, data.address]);
      setForm(emptyAddress);
      setShowForm(false);
      setNotice("Address saved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this address.");
    }
  };
  const deleteAddress = async (id) => {
    setError("");
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((current) => current.filter((address) => address._id !== id));
      setNotice("Address removed.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to remove this address.");
    }
  };
  const logout = () => { signOut(); navigate("/", { replace: true }); };

  return <main className="commerce-page account-page">
    <div className="commerce-page-heading"><div><span className="commerce-kicker">YOUR FOODIEGO PROFILE</span><h1>Hello, {user?.name?.split(" ")[0] || "food lover"} 👋</h1><p>Manage your personal details and delivery addresses.</p></div><button className="commerce-button outline" type="button" onClick={logout}><FiLogOut /> Sign out</button></div>
    {error && <div className="commerce-alert error" role="alert">{error}</div>}{notice && <div className="commerce-alert success">{notice}</div>}
    <div className="account-grid">
      <section className="commerce-panel account-profile"><span className="account-avatar">{(user?.name || "F").slice(0, 1).toUpperCase()}</span><span className="commerce-kicker">ACCOUNT DETAILS</span><h2>{user?.name}</h2><p>{user?.email}</p>{user?.phone && <p>{user.phone}</p>}<div className="account-shortcuts"><Link to="/orders">View your orders →</Link><Link to="/wishlist">See your wishlist →</Link></div></section>
      <section className="commerce-panel account-addresses">
        <div className="commerce-panel-heading"><span className="account-address-icon"><FiMapPin /></span><div><h2>Saved addresses</h2><p>Choose a delivery address at checkout.</p></div></div>
        {addresses.length ? <div className="saved-address-list">{addresses.map((address) => <article className="saved-address" key={address._id}><div><span className="address-type">{address.addressType}{address.isDefault && " · DEFAULT"}</span><strong>{address.fullName}</strong><p>{address.street}{address.landmark ? `, ${address.landmark}` : ""}, {address.city}, {address.state} {address.pincode}</p><small>{address.phone}</small></div><button type="button" aria-label="Delete address" onClick={() => deleteAddress(address._id)}><FiTrash2 /></button></article>)}</div> : <p className="account-no-address">You haven’t saved an address yet.</p>}
        {!showForm && <button className="commerce-button outline" type="button" onClick={() => setShowForm(true)}><FiPlus /> Add address</button>}
        {showForm && <form className="address-form commerce-form" onSubmit={addAddress}><div className="commerce-form-grid">
          <label><span>Full name</span><input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label><label><span>Phone</span><input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label className="wide"><span>Street</span><input required value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} /></label><label className="wide"><span>Landmark <small>(optional)</small></span><input value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} /></label>
          <label><span>City</span><input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label><span>State</span><input required value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></label>
          <label><span>PIN code</span><input required value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} /></label><label><span>Type</span><select value={form.addressType} onChange={(event) => setForm({ ...form, addressType: event.target.value })}><option value="home">Home</option><option value="office">Office</option><option value="other">Other</option></select></label>
        </div><label className="commerce-checkbox"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Set as default</label><div className="commerce-button-row"><button className="commerce-button primary" type="submit">Save address</button><button className="commerce-button subtle" type="button" onClick={() => setShowForm(false)}>Cancel</button></div></form>}
      </section>
    </div>
  </main>;
}

export default Account;
