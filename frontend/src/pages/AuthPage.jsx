import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useAuth } from "../context/useAuth";
import "../styles/Commerce.css";

function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { isAuthenticated, signIn, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={location.state?.from || "/account"} replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await signIn({ email: form.email, password: form.password });
      navigate(location.state?.from || (isRegister ? "/account" : "/"), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="commerce-auth-page">
      <section className="commerce-auth-art">
        <Link to="/" className="commerce-back"><FiArrowLeft /> Back to FoodieGo</Link>
        <span className="commerce-auth-icon">🍜</span>
        <p className="commerce-kicker">YOUR TABLE IS READY</p>
        <h1>Make every meal a little more memorable.</h1>
        <p>Discover neighborhood favorites, save the dishes you love, and track every order in one place.</p>
        <div className="commerce-auth-perks"><span>Fresh picks</span><span>Easy reorders</span><span>Local favorites</span></div>
      </section>
      <section className="commerce-auth-panel">
        <div className="commerce-auth-card">
          <span className="commerce-kicker">{isRegister ? "JOIN THE FOODIEGO COMMUNITY" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Create your account" : "Sign in to FoodieGo"}</h2>
          <p>{isRegister ? "A world of great food is just around the corner." : "Your next favorite meal is waiting."}</p>
          {error && <div className="commerce-alert error" role="alert">{error}</div>}
          <form onSubmit={submit} className="commerce-form">
            {isRegister && <label><span>Your name</span><div><FiUser /><input name="name" autoComplete="name" value={form.name} onChange={update} required minLength="2" placeholder="Alex Morgan" /></div></label>}
            <label><span>Email address</span><div><FiMail /><input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required placeholder="you@example.com" /></div></label>
            {isRegister && <label><span>Phone number <small>(optional)</small></span><div><FiPhone /><input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} placeholder="+91 98765 43210" /></div></label>}
            <label><span>Password</span><div><FiLock /><input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={update} required minLength="6" placeholder="At least 6 characters" /></div></label>
            <button className="commerce-button primary full" type="submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <FiArrowRight /></button>
          </form>
          <p className="commerce-auth-switch">{isRegister ? "Already have an account?" : "New to FoodieGo?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
