import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import api from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import "../styles/Commerce.css";

function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [foods, setFoods] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/wishlist");
      setFoods(data.wishlist?.foods || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your wishlist.");
    }
  }, []);
  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.resolve().then(load);
  }, [isAuthenticated, load]);
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: "/wishlist" }} replace />;

  const remove = async (id) => {
    setError("");
    try { await api.delete(`/wishlist/${id}`); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to remove this item."); }
  };
  const add = async (food) => {
    setError("");
    try { await addToCart(food); setNotice(`${food.name} added to your cart.`); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message); }
  };

  return <main className="commerce-page">
    <div className="commerce-page-heading"><div><span className="commerce-kicker">SAVED FOR LATER</span><h1>Your wishlist <FiHeart className="heading-heart" /></h1><p>The dishes you love, ready whenever you are.</p></div><Link to="/restaurants" className="commerce-button outline">Discover food</Link></div>
    {error && <div className="commerce-alert error" role="alert">{error}</div>}{notice && <div className="commerce-alert success">{notice}</div>}
    {foods.length ? <div className="wishlist-grid">{foods.map((food) => <article className="wishlist-card" key={food._id}><Link to={food.restaurant?._id ? `/restaurants/${food.restaurant._id}` : "/restaurants"} className="wishlist-image">{getImageUrl(food.image) ? <img src={getImageUrl(food.image)} alt={food.name} /> : <span>🍽️</span>}</Link><div className="wishlist-content"><span className="commerce-kicker">{food.restaurant?.name || "FOODIEGO FAVORITE"}</span><h2>{food.name}</h2><p>{food.description || "A delicious favorite, saved just for you."}</p><div className="wishlist-card-bottom"><strong>₹{Number(food.price || 0).toFixed(2)}</strong><div><button type="button" aria-label={`Add ${food.name} to cart`} onClick={() => add(food)}><FiShoppingCart /></button><button type="button" aria-label={`Remove ${food.name} from wishlist`} onClick={() => remove(food._id)}><FiTrash2 /></button></div></div></div></article>)}</div> : <section className="commerce-empty"><span>💛</span><h2>Your wishlist is waiting</h2><p>Save dishes from a restaurant menu and they’ll be collected here.</p><Link className="commerce-button primary" to="/restaurants">Find your favorites</Link></section>}
  </main>;
}

export default Wishlist;
