import { useState } from "react";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { MdFastfood } from "react-icons/md";
import { useAuth } from "../useAuth";

function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-art">
        <div className="login-brand"><span className="brand-mark"><MdFastfood /></span><span>bite<span>board</span></span></div>
        <div className="login-art-copy"><div className="eyebrow light"><span /> YOUR BUSINESS, AT A GLANCE</div><h1>Good food.<br /><em>Great operations.</em></h1><p>One calm, clear space to manage every part of your food business.</p><div className="login-art-stats"><div><strong>01</strong><span>One workspace</span></div><div><strong>∞</strong><span>Room to grow</span></div><div><strong>24/7</strong><span>Always in control</span></div></div></div>
        <div className="art-decoration art-decoration-one">✳</div><div className="art-decoration art-decoration-two">✦</div><div className="login-art-footer">Biteboard Admin Studio <span>•</span> Made for the people behind the plate</div>
      </section>
      <section className="login-panel"><div className="login-form-wrap"><div className="login-greeting"><span className="login-icon"><FiLock /></span><div className="eyebrow">ADMIN ACCESS</div><h2>Welcome back</h2><p>Sign in with your administrator account to continue.</p></div><form onSubmit={submit} className="login-form"><label>Email address<div className="input-with-icon"><FiMail /><input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@foodiego.com" required /></div></label><label>Password<div className="input-with-icon"><FiLock /><input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary login-submit" disabled={busy}>{busy ? "Signing in…" : <>Enter dashboard <FiArrowRight /></>}</button></form><p className="login-security">Secured with your FoodieGo administrator account.</p></div></section>
    </main>
  );
}

export default Login;
