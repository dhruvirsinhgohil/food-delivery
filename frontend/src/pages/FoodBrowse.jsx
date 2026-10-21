import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FiHeart, FiSearch, FiShoppingCart, FiStar } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import "../styles/Commerce.css";

const imageUrl = (image) => !image ? "" : image.startsWith("http") ? image : `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${image.startsWith("/") ? "" : "/"}${image}`;
const foodsFrom = (data) => data.foods || data.data?.foods || (Array.isArray(data.data) ? data.data : []);

function FoodBrowse() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const search = params.get("search") || "";
  const categoryId = params.get("category") || "";
  const foodType = params.get("foodType") || "all";

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/foods"), api.get("/categories")])
      .then(([foodResponse, categoryResponse]) => {
        if (!active) return;
        setFoods(foodsFrom(foodResponse.data).filter((food) => food.isAvailable !== false));
        setCategories(categoryResponse.data.categories || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load the food menu."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/wishlist")
      .then(({ data }) => setFavorites((data.wishlist?.foods || []).map((food) => food._id)))
      .catch((requestError) => console.error("Unable to load wishlist items:", requestError.response?.data || requestError.message));
  }, [isAuthenticated]);

  const visibleFoods = useMemo(() => foods.filter((food) => {
    const category = typeof food.category === "object" ? food.category : { name: food.category };
    const categoryMatches = !categoryId || category._id === categoryId || category.name?.toLowerCase() === categories.find((item) => item._id === categoryId)?.name?.toLowerCase();
    const queryMatches = `${food.name} ${food.description || ""} ${food.restaurant?.name || ""}`.toLowerCase().includes(search.toLowerCase());
    const typeMatches = foodType === "all" || food.foodType === foodType;
    return categoryMatches && queryMatches && typeMatches;
  }), [categories, categoryId, foodType, foods, search]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key); else next.set(key, value);
    setParams(next);
  };
  const toggleFavorite = async (food) => {
    if (!isAuthenticated) return navigate("/login", { state: { from: `/foods${window.location.search}` } });
    setError("");
    try {
      if (favorites.includes(food._id)) {
        await api.delete(`/wishlist/${food._id}`);
        setFavorites((current) => current.filter((id) => id !== food._id));
      } else {
        await api.post("/wishlist", { foodId: food._id });
        setFavorites((current) => [...current, food._id]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update your wishlist.");
    }
  };
  const add = async (food) => {
    setError("");
    if (food.restaurant?.isOpen === false || food.restaurant?.isActive === false) {
      setError("This restaurant is currently not accepting orders.");
      return;
    }
    try {
      await addToCart(food);
      setNotice(`${food.name} added to your cart.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  };

  return <main className="commerce-page food-browse-page">
    <div className="commerce-page-heading"><div><span className="commerce-kicker">SOMETHING DELICIOUS AWAITS</span><h1>Explore the menu</h1><p>Fresh favorites from restaurants around you.</p></div><Link to="/cart" className="commerce-button outline"><FiShoppingCart /> View cart</Link></div>
    <div className="food-browse-controls">
      <label className="food-search"><FiSearch /><input type="search" value={search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search dishes or restaurants" aria-label="Search dishes or restaurants" /></label>
      <select value={foodType} onChange={(event) => setFilter("foodType", event.target.value)} aria-label="Filter by food type"><option value="all">All food types</option><option value="veg">Vegetarian</option><option value="vegan">Vegan</option><option value="non-veg">Non-vegetarian</option></select>
    </div>
    <div className="food-category-chips"><button className={!categoryId ? "active" : ""} type="button" onClick={() => setFilter("category", "")}>All dishes</button>{categories.map((category) => <button className={categoryId === category._id ? "active" : ""} key={category._id} type="button" onClick={() => setFilter("category", category._id)}>{category.name}</button>)}</div>
    {error && <div className="commerce-alert error" role="alert">{error}</div>}{notice && <div className="commerce-alert success" role="status">{notice}</div>}
    {loading ? <div className="commerce-loading"><span className="commerce-spinner" /> Loading delicious food…</div> : visibleFoods.length ? <div className="food-browse-grid">{visibleFoods.map((food) => <article className="browse-food-card" key={food._id}>
      <div className="browse-food-image">{imageUrl(food.image) ? <img src={imageUrl(food.image)} alt={food.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.classList.add("image-failed"); }} /> : <span>🍲</span>}<span className={`browse-food-type ${food.foodType || "veg"}`}>{food.foodType || "veg"}</span><button type="button" className={favorites.includes(food._id) ? "favorite active" : "favorite"} onClick={() => toggleFavorite(food)} aria-label="Toggle wishlist"><FiHeart /></button></div>
      <div className="browse-food-copy"><span className="commerce-kicker">{food.restaurant?.name || "LOCAL RESTAURANT"}{food.restaurant?.isOpen === false ? " · CLOSED" : ""}</span><h2>{food.name}</h2><p>{food.description || "Freshly prepared with delicious ingredients."}</p><div className="browse-food-footer"><span className="browse-rating"><FiStar /> {Number(food.rating || 0).toFixed(1)}</span><strong>₹{(Number(food.price || 0) * (1 - Number(food.discount || 0) / 100)).toFixed(2)}</strong><button type="button" disabled={food.isAvailable === false || food.restaurant?.isOpen === false || food.restaurant?.isActive === false} onClick={() => add(food)}><FiShoppingCart />{food.restaurant?.isOpen === false ? "Closed" : "Add"}</button></div></div>
    </article>)}</div> : <section className="commerce-empty"><span>🔎</span><h2>No dishes found</h2><p>Try a different search or remove some filters.</p><button className="commerce-button outline" type="button" onClick={() => setParams({})}>Clear filters</button></section>}
  </main>;
}

export default FoodBrowse;
