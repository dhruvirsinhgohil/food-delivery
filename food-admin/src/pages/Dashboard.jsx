import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowDownRight, FiArrowRight, FiArrowUpRight, FiClock,
  FiDollarSign, FiPackage, FiRefreshCw, FiShoppingBag, FiUsers,
} from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import api, { getList } from "../api";
import { EmptyMessage, StatusBadge } from "../components/ui";
import { formatDate } from "../utils/format";

const resources = [
  ["users", "users"], ["restaurants", "restaurants"], ["foods", "foods"],
  ["orders", "orders"], ["categories", "categories"], ["coupons", "coupons"],
  ["partners", "partners"],
];

function Dashboard({ onNotice }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [today] = useState(() => new Date());

  const load = useCallback(() => {
    return Promise.all([
        api.get("/users"),
        api.get("/restaurants/admin/all"),
        api.get("/foods", { params: { includeUnavailable: true } }),
        api.get("/orders"),
        api.get("/categories/admin/all"),
        api.get("/coupons/admin/all"),
        api.get("/delivery-partners"),
      ])
      .then((responses) => {
      const next = Object.fromEntries(resources.map(([key, field], index) => [
        key, getList(responses[index].data, field),
      ]));
      setData(next);
      const pending = next.orders.filter((order) => !["delivered", "cancelled"].includes(order.orderStatus)).length;
      onNotice(pending ? `${pending} order${pending === 1 ? "" : "s"} need attention.` : null);
      })
      .catch((err) => {
      setError(err.response?.data?.message || "Unable to load dashboard data. Please retry.");
      })
      .finally(() => {
      setBusy(false);
      });
  }, [onNotice]);

  useEffect(() => { load(); }, [load]);
  const refresh = () => {
    setBusy(true);
    setError("");
    load();
  };

  if (busy && !data) return <div className="content-loader"><span className="loader" />Loading your overview…</div>;
  if (error && !data) return <div className="error-card"><strong>Dashboard couldn’t load</strong><p>{error}</p><button className="button button-secondary" onClick={refresh}><FiRefreshCw /> Try again</button></div>;

  const totals = data.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const pendingRestaurants = data.restaurants.filter((restaurant) => !restaurant.isApproved).length;
  const activeOrders = data.orders.filter((order) => !["delivered", "cancelled"].includes(order.orderStatus)).length;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const amount = data.orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created.toDateString() === date.toDateString();
    }).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return { label: date.toLocaleDateString("en", { weekday: "short" }), amount };
  });
  const maxAmount = Math.max(...days.map((day) => day.amount), 1);
  const latestOrders = [...data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome"><div><div className="welcome-kicker"><span className="welcome-spark">✳</span> YOUR DAILY SNAPSHOT</div><h2>Small details. <em>Big picture.</em></h2><p>A quick look at how your marketplace is moving today.</p></div><div className="welcome-illustration"><span className="illus-plate">🍜</span><span className="illus-spark spark-a">✦</span><span className="illus-spark spark-b">✳</span><span className="illus-orbit" /></div></div>

      <div className="metric-grid">
        <Metric title="Gross order value" value={`₹${totals.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} caption={`${data.orders.length} total orders`} icon={FiDollarSign} tone="peach" trend="Live total" />
        <Metric title="Orders in motion" value={activeOrders.toString()} caption="Awaiting completion" icon={FiShoppingBag} tone="lilac" trend="Live" />
        <Metric title="Restaurant partners" value={data.restaurants.length.toString()} caption={pendingRestaurants ? `${pendingRestaurants} awaiting approval` : "All reviewed"} icon={MdOutlineRestaurantMenu} tone="mint" trend={pendingRestaurants ? "Needs review" : "Up to date"} />
        <Metric title="Community" value={data.users.length.toLocaleString()} caption={`${data.partners.length} delivery partners`} icon={FiUsers} tone="blue" trend="All accounts" />
      </div>

      {error && <div className="inline-error">{error}</div>}
      <div className="dashboard-grid">
        <section className="panel revenue-panel"><div className="panel-heading"><div><div className="eyebrow">LAST 7 DAYS</div><h3>Order value</h3><p>Daily order totals across the platform</p></div><button className="icon-button" onClick={refresh} aria-label="Refresh dashboard"><FiRefreshCw /></button></div><div className="chart-total"><strong>₹{days.reduce((sum, day) => sum + day.amount, 0).toLocaleString("en-IN")}</strong><span><FiArrowUpRight /> This week</span></div><div className="bar-chart">{days.map((day, index) => <div className="chart-column" key={`${day.label}-${index}`}><span className="bar-value">{day.amount ? `₹${day.amount}` : "—"}</span><div className="bar-track"><div className={`bar-fill ${index === 6 ? "bar-highlight" : ""}`} style={{ height: `${Math.max(day.amount / maxAmount * 100, 5)}%` }} /></div><span className="bar-label">{day.label}</span></div>)}</div></section>
        <section className="panel pulse-panel"><div className="panel-heading"><div><div className="eyebrow">ON YOUR RADAR</div><h3>Needs a look</h3></div><span className="pulse-icon">✦</span></div><div className="pulse-list"><PulseRow icon={FiClock} title="Restaurant reviews" detail={pendingRestaurants ? `${pendingRestaurants} waiting for approval` : "Nothing to review"} count={pendingRestaurants} to="/restaurants" tone="orange" /><PulseRow icon={FiPackage} title="Active orders" detail={activeOrders ? "In progress right now" : "No active orders"} count={activeOrders} to="/orders" tone="purple" /><PulseRow icon={FiUsers} title="Delivery partners" detail="Your delivery crew" count={data.partners.length} to="/delivery" tone="green" /></div><Link className="text-link" to="/restaurants">Open operations <FiArrowRight /></Link></section>
      </div>
      <section className="panel recent-panel"><div className="panel-heading recent-heading"><div><div className="eyebrow">THE LATEST</div><h3>Recent orders</h3><p>Stay close to what’s happening on the ground.</p></div><Link to="/orders" className="button button-secondary">View all orders <FiArrowRight /></Link></div>{latestOrders.length ? <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>RESTAURANT</th><th>AMOUNT</th><th>STATUS</th><th>WHEN</th></tr></thead><tbody>{latestOrders.map((order) => <tr key={order._id}><td><strong className="order-id">{order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</strong></td><td>{order.user?.name || "Customer"}</td><td>{order.restaurant?.name || "Restaurant"}</td><td className="amount-cell">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</td><td><StatusBadge status={order.orderStatus} /></td><td className="muted-cell">{formatDate(order.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyMessage title="No orders just yet" detail="New orders will appear here when customers check out." />}</section>
    </div>
  );
}

function Metric({ title, value, caption, icon: Icon, tone, trend }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon /></div><span className="metric-trend">{tone === "peach" ? <FiArrowUpRight /> : tone === "lilac" ? <FiArrowDownRight /> : null}{trend}</span><p className="metric-title">{title}</p><strong className="metric-value">{value}</strong><p className="metric-caption">{caption}</p></article>;
}

function PulseRow({ icon: Icon, title, detail, count, to, tone }) {
  return <Link className="pulse-row" to={to}><span className={`pulse-row-icon ${tone}`}><Icon /></span><span className="pulse-row-copy"><strong>{title}</strong><small>{detail}</small></span><b className={count ? "pulse-count" : "pulse-count zero"}>{count}</b><FiArrowRight className="pulse-arrow" /></Link>;
}

export default Dashboard;
