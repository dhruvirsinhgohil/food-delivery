import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiActivity, FiBell, FiChevronLeft, FiChevronRight, FiGrid,
  FiLogOut, FiMenu, FiTag, FiTruck, FiUsers, FiX,
} from "react-icons/fi";
import { MdFastfood, MdOutlineRestaurantMenu } from "react-icons/md";
import { useAuth } from "../useAuth";

const navItems = [
  { to: "/", label: "Overview", icon: FiGrid, end: true },
  { to: "/restaurants", label: "Restaurants", icon: MdOutlineRestaurantMenu },
  { to: "/foods", label: "Menu & foods", icon: MdFastfood },
  { to: "/categories", label: "Categories", icon: FiTag },
  { to: "/orders", label: "Orders", icon: FiActivity },
  { to: "/customers", label: "Customers", icon: FiUsers },
  { to: "/coupons", label: "Promotions", icon: FiTag },
  { to: "/delivery", label: "Delivery team", icon: FiTruck },
];

const titles = {
  "/": ["Good to see you", "Here’s what’s happening across your food business."],
  "/restaurants": ["Restaurants", "Review partners and keep restaurant listings healthy."],
  "/foods": ["Menu & foods", "Manage menu items, pricing, availability and categories."],
  "/categories": ["Categories", "Organize the menu into clear, discoverable collections."],
  "/orders": ["Orders", "Monitor every order and keep fulfillment moving."],
  "/customers": ["Customers", "Manage customer access and create partner accounts."],
  "/coupons": ["Promotions", "Create and manage discounts for your customers."],
  "/delivery": ["Delivery team", "Manage delivery accounts, vehicles and availability."],
};

function AdminLayout({ children, notice, onDismissNotice }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [todayLabel] = useState(() => new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date()));
  const [title, subtitle] = titles[location.pathname] || titles["/"];

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <span className="brand-mark"><MdFastfood /></span>
          <span className="brand-text">bite<span>board</span><small>ADMIN STUDIO</small></span>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><FiX /></button>
        </div>
        <div className="workspace-switch"><span className="workspace-dot" /><span><strong>FoodieGo</strong><small>Operations workspace</small></span><FiChevronRight /></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="side-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon /><span>{label}</span>{label === "Orders" && <span className="nav-ping" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">✦</div><strong>Need a hand?</strong><p>Visit the support center to get help.</p><a href="mailto:support@foodiego.example">Contact support <FiChevronRight /></a></div>
          <button className="collapse-btn" onClick={() => setCollapsed((value) => !value)}><FiChevronLeft /><span>Collapse sidebar</span></button>
          <div className="profile-row"><div className="avatar">{(user?.name || "A").slice(0, 1).toUpperCase()}</div><span className="profile-copy"><strong>{user?.name || "Administrator"}</strong><small>Administrator</small></span><button className="icon-button signout-button" title="Sign out" onClick={signOut}><FiLogOut /></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><FiMenu /></button>
          <div className="breadcrumb"><span>Workspace</span><FiChevronRight /><strong>{title === "Good to see you" ? "Overview" : title}</strong></div>
          <div className="topbar-actions">
            <span className="today-pill"><span /> Live overview</span>
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNoticeOpen((value) => !value)}><FiBell />{notice && <i />}</button>{noticeOpen && <div className="notification-popover"><strong>Notifications</strong><p>{notice || "You’re all caught up. Updates will appear here."}</p><button onClick={() => { onDismissNotice(); setNoticeOpen(false); }}>Clear updates</button></div>}</div>
            <div className="top-avatar">{(user?.name || "A").slice(0, 1).toUpperCase()}</div>
          </div>
        </header>
        <section className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow"><span /> FOODIEGO ADMINISTRATION</div><h1>{title === "Good to see you" ? `Welcome back, ${(user?.name || "Admin").split(" ")[0]}` : title}<span className="heading-period">.</span></h1><p>{subtitle}</p></div><div className="heading-date">{todayLabel}</div></div>
          {children}
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;
