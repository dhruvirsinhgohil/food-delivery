import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import api, { getList } from "../api";
import FormDialog from "../components/FormDialog";
import { EmptyMessage, StatusBadge } from "../components/ui";
import { formatDate } from "../utils/format";

const endpoints = {
  restaurants: { url: "/restaurants/admin/all", key: "restaurants", title: "Restaurants", description: "Every restaurant and its approval status.", add: false },
  foods: { url: "/foods?includeUnavailable=true", key: "foods", title: "Menu items", description: "Create and update menu items across your restaurants.", add: true, button: "Add menu item" },
  categories: { url: "/categories/admin/all", key: "categories", title: "Categories", description: "Keep food discovery organized and consistent.", add: true, button: "New category" },
  orders: { url: "/orders", key: "orders", title: "Orders", description: "Track every customer order through fulfillment.", add: false },
  customers: { url: "/users", key: "users", title: "Accounts", description: "Customer, restaurant and delivery accounts.", add: true, button: "Create account" },
  coupons: { url: "/coupons/admin/all", key: "coupons", title: "Coupons", description: "Manage discounts, usage windows and active offers.", add: true, button: "Create promotion" },
  delivery: { url: "/delivery-partners", key: "partners", title: "Delivery partners", description: "Partner profiles, vehicles and delivery readiness.", add: true, button: "Add delivery partner" },
};

const orderStatuses = ["placed", "confirmed", "preparing", "ready", "picked_up", "out_for_delivery", "delivered", "cancelled"];

function ResourcePage({ resource, onNotice }) {
  const config = endpoints[resource];
  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({ restaurants: [], categories: [], users: [] });
  const [busy, setBusy] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    const requests = [api.get(config.url)];
    const needsLists = resource === "foods" || resource === "delivery" || resource === "categories";
    if (needsLists) {
      requests.push(
        api.get("/restaurants/admin/all"),
        api.get("/categories/admin/all"),
        api.get("/users"),
        api.get("/foods", { params: { includeUnavailable: true } }),
      );
    }

    return Promise.all(requests)
      .then(([response, restaurantsResponse, categoriesResponse, usersResponse, foodsResponse]) => {
        setRows(getList(response.data, config.key));
        if (needsLists) {
        setLists({
          restaurants: getList(restaurantsResponse.data, "restaurants"),
          categories: getList(categoriesResponse.data, "categories"),
          users: getList(usersResponse.data, "users"),
          foods: getList(foodsResponse.data, "foods"),
        });
        }
      })
      .catch((err) => {
      setError(err.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
      })
      .finally(() => {
      setBusy(false);
      });
  }, [config, resource]);

  useEffect(() => { load(); }, [load]);
  const refresh = () => {
    setBusy(true);
    setError("");
    load();
  };

  const fields = useMemo(() => getFields(resource, lists), [resource, lists]);
  const initialValues = useMemo(() => modal?.row ? mapToForm(resource, modal.row) : {}, [modal, resource]);

  const notify = (message) => {
    onNotice(message);
    window.setTimeout(() => onNotice(null), 3600);
  };

  const runAction = async (action, message) => {
    setActionBusy(true);
    setActionError("");
    try {
      await action();
      await load();
      setModal(null);
      notify(message);
    } catch (err) {
      const messageText = err.response?.data?.message || err.message || "The requested change failed.";
      setActionError(messageText);
      onNotice(messageText);
    } finally {
      setActionBusy(false);
    }
  };

  const save = async (values) => {
    let payload = normalizePayload(resource, values);
    if (resource === "customers") {
      const { accountType, ...account } = values;
      await runAction(async () => {
        await api.post(accountType === "restaurant" ? "/users/restaurant" : "/users/delivery", account);
      }, "Account created successfully.");
      return;
    }
    if (resource === "delivery") {
      await runAction(async () => {
        const { data } = await api.post("/users/delivery", {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
        });
        const userId = data.user?.id || data.user?._id;
        if (!userId) throw new Error("Delivery account was created, but no user ID was returned.");
        try {
          await api.post("/delivery-partners", {
            userId,
            vehicleType: payload.vehicleType,
            vehicleNumber: payload.vehicleNumber,
            licenseNumber: payload.licenseNumber,
          });
        } catch (err) {
          const cause = err.response?.data?.message || err.message;
          throw new Error(`Delivery login was created, but partner setup failed: ${cause}`);
        }
      }, "Delivery partner added successfully.");
      return;
    }

    const url = resource === "restaurants" ? "/restaurants" : resource === "foods" ? "/foods" : resource === "categories" ? "/categories" : "/coupons";
    await runAction(async () => {
      if (resource === "restaurants" || resource === "foods") {
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          if (key === "image" && !(value instanceof File)) continue;
          formData.append(key, value !== null && typeof value === "object" && !(value instanceof File) ? JSON.stringify(value) : value);
        }
        const requestUrl = resource === "restaurants" && modal?.row
          ? `${url}/${modal.row._id}/admin`
          : modal?.row
            ? `${url}/${modal.row._id}`
            : url;
        const request = modal?.row ? api.put : api.post;
        await request(requestUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      else if (modal?.row) await api.put(`${url}/${modal.row._id}`, payload);
      else await api.post(url, payload);
    }, modal?.row ? "Changes saved successfully." : "Created successfully.");
  };

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => searchableValues(resource, row).some((value) => value.toLowerCase().includes(term)));
  }, [rows, query, resource]);

  const editRow = (row) => {
    setActionError("");
    setModal({ row });
  };

  const create = () => {
    setActionError("");
    setModal({ row: null });
  };

  const remove = (row) => {
    const title = row.name || row.code || row.orderNumber || "this item";
    if (!window.confirm(`Are you sure you want to remove ${title}?`)) return;
    if (resource === "foods") runAction(() => api.delete(`/foods/${row._id}`), "Menu item marked unavailable.");
    if (resource === "categories") runAction(() => api.delete(`/categories/${row._id}`), "Category deactivated.");
    if (resource === "coupons") runAction(() => api.delete(`/coupons/${row._id}`), "Promotion deactivated.");
  };

  const toggleUser = (row) => runAction(() => api.patch(`/users/${row._id}/status`, { isActive: row.isActive === false }), "Account status updated.");
  const approveRestaurant = (row) => runAction(() => api.patch(`/restaurants/${row._id}/approve`), "Restaurant approved.");
  const toggleRestaurant = (row, field) => runAction(() => api.patch(`/restaurants/${row._id}/status`, { [field]: !row[field] }), "Restaurant status updated.");
  const togglePartner = (row, field) => runAction(() => api.patch(`/delivery-partners/${row._id}/status`, { [field]: !row[field] }), "Partner status updated.");

  const updateOrder = async (row, status) => {
    await runAction(() => api.patch(`/orders/${row._id}/status`, { status }), "Order status updated.");
  };

  return (
    <div className="resource-content">
      <div className="resource-toolbar"><div className="resource-summary"><span className="resource-count">{rows.length}</span><span>{config.description}</span></div><div className="toolbar-controls"><label className="search-control"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} /></label><button className="icon-button refresh-button" aria-label="Refresh list" onClick={refresh}><FiRefreshCw /></button>{config.add && <button className="button button-primary" onClick={create}><FiPlus />{config.button}</button>}</div></div>
      {error && <div className="error-card compact"><strong>Couldn’t load {config.title.toLowerCase()}</strong><p>{error}</p><button className="button button-secondary" onClick={refresh}><FiRefreshCw /> Retry</button></div>}
      {actionError && <div className="inline-error">{actionError}</div>}
      <section className="panel resource-panel">
        <div className="resource-panel-heading"><div><div className="eyebrow">ALL RECORDS</div><h3>{config.title}</h3></div><span className="record-count">{filteredRows.length} shown</span></div>
        {busy ? <div className="content-loader small"><span className="loader" />Loading records…</div> : filteredRows.length ? <div className="table-wrap"><table><thead><tr>{columns[resource].map((column) => <th key={column}>{column}</th>)}<th className="action-heading">ACTIONS</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row._id}>{renderCells(resource, row, { lists, updateOrder, toggleUser, approveRestaurant, toggleRestaurant, togglePartner, editRow, remove, actionBusy })}<td><div className="row-actions">{resource === "foods" || resource === "categories" || resource === "coupons" ? <><button className="row-action" title="Edit" onClick={() => editRow(row)}><FiEdit2 /></button><button className="row-action danger" title="Deactivate" onClick={() => remove(row)}><FiTrash2 /></button></> : resource === "customers" ? <button className={`mini-toggle ${row.isActive === false ? "off" : ""}`} disabled={actionBusy} onClick={() => toggleUser(row)}>{row.isActive === false ? "Enable" : "Disable"}</button> : resource === "restaurants" ? <div className="row-action-stack"><button className="row-action" title="Edit restaurant" aria-label={`Edit ${row.name}`} disabled={actionBusy} onClick={() => editRow(row)}><FiEdit2 /></button>{!row.isApproved && <button className="mini-toggle approve" disabled={actionBusy} onClick={() => approveRestaurant(row)}><FiCheck /> Approve</button>}<button className="mini-toggle" disabled={actionBusy} onClick={() => toggleRestaurant(row, "isOpen")}>{row.isOpen ? "Close" : "Open"}</button><button className={`mini-toggle ${row.isActive === false ? "off" : ""}`} disabled={actionBusy} onClick={() => toggleRestaurant(row, "isActive")}>{row.isActive === false ? "Enable" : "Disable"}</button></div> : resource === "delivery" ? <div className="row-action-stack"><button className="mini-toggle" disabled={actionBusy} onClick={() => togglePartner(row, "isOnline")}>{row.isOnline ? "Take offline" : "Set online"}</button><button className={`mini-toggle ${row.isAvailable === false ? "off" : ""}`} disabled={actionBusy} onClick={() => togglePartner(row, "isAvailable")}>{row.isAvailable === false ? "Enable" : "Pause"}</button></div> : <span className="muted-cell">—</span>}</div></td></tr>)}</tbody></table></div> : <EmptyMessage title={query ? "No matching records" : `No ${config.title.toLowerCase()} yet`} detail={query ? "Try another search term." : "When you add records, they’ll show up here."} />}
      </section>
      {modal && <FormDialog key={`${resource}-${modal.row?._id || "new"}`} title={modal.row ? `Edit ${singular[resource]}` : config.button} description={modal.row ? "Update the details below and save your changes." : `Add a new ${singular[resource]} to your workspace.`} fields={fields} initialValues={initialValues} busy={actionBusy} error={actionError} onClose={() => { setModal(null); setActionError(""); }} onSubmit={save} />}
    </div>
  );
}

const columns = {
  restaurants: ["RESTAURANT", "OWNER", "APPROVAL", "OPEN", "VISIBILITY"],
  foods: ["ITEM", "RESTAURANT", "CATEGORY", "PRICE", "AVAILABILITY"],
  categories: ["CATEGORY", "DESCRIPTION", "MENU ITEMS", "STATUS"],
  orders: ["ORDER", "CUSTOMER", "RESTAURANT", "TOTAL", "PAYMENT", "ORDER STATUS"],
  customers: ["ACCOUNT", "EMAIL", "ROLE", "JOINED", "STATUS"],
  coupons: ["PROMOTION", "DISCOUNT", "VALID UNTIL", "REDEMPTIONS", "STATUS"],
  delivery: ["PARTNER", "VEHICLE", "DELIVERIES", "ONLINE", "AVAILABILITY"],
};

const singular = { restaurants: "restaurant", foods: "menu item", categories: "category", orders: "order", customers: "account", coupons: "promotion", delivery: "delivery partner" };

function renderCells(resource, row, actions) {
  switch (resource) {
    case "restaurants":
      return <><td><strong>{row.name}</strong><small className="cell-subtext">{Array.isArray(row.cuisines) ? row.cuisines.join(" · ") : row.cuisines || "Restaurant partner"}</small></td><td>{row.owner?.name || "Owner"}<small className="cell-subtext">{row.owner?.email || "—"}</small></td><td><StatusBadge status={row.isApproved ? "approved" : "pending"} /></td><td><StatusBadge status={row.isOpen ? "open" : "closed"} /></td><td><StatusBadge status={row.isActive === false ? "inactive" : "active"} /></td></>;
    case "foods":
      return <><td><strong>{row.name}</strong><small className="cell-subtext">{row.foodType || "veg"}{row.discount ? ` · ${row.discount}% off` : ""}</small></td><td>{row.restaurant?.name || "Restaurant"}</td><td>{row.category?.name || "Uncategorized"}</td><td className="amount-cell">₹{Number(row.price || 0).toLocaleString("en-IN")}</td><td><StatusBadge status={row.isAvailable === false ? "unavailable" : "available"} /></td></>;
    case "categories":
      return <><td><strong>{row.name}</strong></td><td className="muted-cell description-cell">{row.description || "—"}</td><td>{actions.lists.foods?.filter((food) => food.category?._id === row._id || food.category === row._id).length || 0}</td><td><StatusBadge status={row.isActive === false ? "inactive" : "active"} /></td></>;
    case "orders":
      return <><td><strong className="order-id">{row.orderNumber || `#${row._id.slice(-6).toUpperCase()}`}</strong><small className="cell-subtext">{formatDate(row.createdAt)}</small></td><td>{row.user?.name || "Customer"}</td><td>{row.restaurant?.name || "Restaurant"}</td><td className="amount-cell">₹{Number(row.totalAmount || 0).toLocaleString("en-IN")}</td><td><StatusBadge status={row.paymentStatus || "pending"} /></td><td><select className="status-select" value={row.orderStatus || "placed"} onChange={(event) => actions.updateOrder(row, event.target.value)} disabled={actions.actionBusy}>{orderStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></>;
    case "customers":
      return <><td><strong>{row.name}</strong></td><td className="muted-cell">{row.email}</td><td><span className="role-pill">{row.role || "customer"}</span></td><td className="muted-cell">{formatDate(row.createdAt)}</td><td><StatusBadge status={row.isActive === false ? "inactive" : "active"} /></td></>;
    case "coupons":
      return <><td><strong className="coupon-code">{row.code}</strong><small className="cell-subtext">{row.description || "Promotion"}</small></td><td>{row.discountType === "percentage" ? `${row.discountValue}%` : `₹${row.discountValue}`} off</td><td className="muted-cell">{formatDate(row.expiryDate)}</td><td>{row.usedCount || 0}{row.usageLimit ? ` / ${row.usageLimit}` : ""}</td><td><StatusBadge status={row.isActive === false ? "inactive" : new Date(row.expiryDate) < new Date() ? "expired" : "active"} /></td></>;
    case "delivery":
      return <><td><strong>{row.user?.name || "Delivery partner"}</strong><small className="cell-subtext">{row.user?.email || "—"}</small></td><td>{row.vehicleType || "Bike"}<small className="cell-subtext">{row.vehicleNumber || "No registration"}</small></td><td>{row.totalDeliveries || 0}</td><td><StatusBadge status={row.isOnline ? "online" : "offline"} /></td><td><StatusBadge status={row.isAvailable === false ? "paused" : "available"} /></td></>;
    default: return null;
  }
}

function getFields(resource, lists) {
  if (resource === "restaurants") return [
    { name: "name", label: "Restaurant name", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone number" },
    { name: "email", label: "Email address", type: "email" },
    { name: "street", label: "Street address" },
    { name: "city", label: "City" },
    { name: "state", label: "State" },
    { name: "pincode", label: "Pincode" },
    { name: "cuisines", label: "Cuisines", placeholder: "For example, Indian, Chinese" },
    { name: "deliveryTime", label: "Delivery time (minutes)", type: "number", min: 0 },
    { name: "deliveryFee", label: "Delivery fee (₹)", type: "number", min: 0, step: "0.01" },
    { name: "image", label: "Restaurant image", type: "file", accept: "image/jpeg,image/png,image/webp" },
  ];
  if (resource === "categories") return [
    { name: "name", label: "Category name", required: true, placeholder: "For example, Desserts" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "image", label: "Image URL" },
    { name: "isActive", label: "Category is active", type: "checkbox", defaultValue: true },
  ];
  if (resource === "foods") return [
    { name: "name", label: "Food name", required: true },
    { name: "restaurant", label: "Restaurant", type: "select", required: true, options: lists.restaurants.filter((row) => row.isActive !== false).map((row) => ({ value: row._id, label: row.name })) },
    { name: "category", label: "Category", type: "select", required: true, options: lists.categories.filter((row) => row.isActive !== false).map((row) => ({ value: row._id, label: row.name })) },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price (₹)", type: "number", min: 0, step: "0.01", required: true },
    { name: "discount", label: "Discount (%)", type: "number", min: 0, max: 100, step: "0.1", defaultValue: 0 },
    { name: "foodType", label: "Food type", type: "select", defaultValue: "veg", options: ["veg", "non-veg", "vegan"].map((value) => ({ value, label: value })) },
    { name: "image", label: "Food image", type: "file", accept: "image/jpeg,image/png,image/webp" },
    { name: "isAvailable", label: "Available to order", type: "checkbox", defaultValue: true },
  ];
  if (resource === "coupons") return [
    { name: "code", label: "Coupon code", required: true, placeholder: "WELCOME10" },
    { name: "description", label: "Description" },
    { name: "discountType", label: "Discount type", type: "select", required: true, options: [{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }] },
    { name: "discountValue", label: "Discount value", type: "number", required: true, min: 0, step: "0.01" },
    { name: "minimumOrderAmount", label: "Minimum order (₹)", type: "number", min: 0, defaultValue: 0 },
    { name: "maximumDiscount", label: "Maximum discount (₹)", type: "number", min: 0 },
    { name: "usageLimit", label: "Usage limit", type: "number", min: 1, defaultValue: 100 },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "expiryDate", label: "Expiry date", type: "date", required: true },
    { name: "isActive", label: "Promotion is active", type: "checkbox", defaultValue: true },
  ];
  if (resource === "customers") return [
    { name: "accountType", label: "Account type", type: "select", required: true, defaultValue: "restaurant", options: [{ value: "restaurant", label: "Restaurant owner" }, { value: "delivery", label: "Delivery partner" }] },
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email address", type: "email", required: true },
    { name: "password", label: "Temporary password", type: "password", required: true },
    { name: "phone", label: "Phone number" },
  ];
  if (resource === "delivery") return [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email address", type: "email", required: true },
    { name: "password", label: "Temporary password", type: "password", required: true },
    { name: "phone", label: "Phone number" },
    { name: "vehicleType", label: "Vehicle type", type: "select", required: true, defaultValue: "bike", options: ["bike", "scooter", "cycle", "car"].map((value) => ({ value, label: value })) },
    { name: "vehicleNumber", label: "Vehicle registration", required: true },
    { name: "licenseNumber", label: "License number", required: true },
  ];
  return [];
}

function mapToForm(resource, row) {
  const value = { ...row };
  if (resource === "restaurants") {
    value.street = row.address?.street || "";
    value.city = row.address?.city || "";
    value.state = row.address?.state || "";
    value.pincode = row.address?.pincode || "";
    value.cuisines = Array.isArray(row.cuisines) ? row.cuisines.join(", ") : row.cuisines || "";
  }
  if (resource === "foods") {
    value.restaurant = row.restaurant?._id || row.restaurant || "";
    value.category = row.category?._id || row.category || "";
  }
  if (resource === "coupons") {
    for (const field of ["startDate", "expiryDate"]) {
      value[field] = row[field] ? new Date(row[field]).toISOString().slice(0, 10) : "";
    }
  }
  return value;
}

function normalizePayload(resource, values) {
  const payload = { ...values };
  if (resource === "restaurants") {
    payload.address = {
      street: payload.street.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
    };
    delete payload.street;
    delete payload.city;
    delete payload.state;
    delete payload.pincode;
    payload.cuisines = payload.cuisines.split(",").map((cuisine) => cuisine.trim()).filter(Boolean);
  }
  for (const [key, value] of Object.entries(payload)) {
    if (value === "" && ["maximumDiscount", "image"].includes(key)) payload[key] = key === "maximumDiscount" ? null : "";
    else if (value === "" && ["deliveryTime", "deliveryFee"].includes(key)) delete payload[key];
    else if (value !== "" && ["price", "discount", "discountValue", "minimumOrderAmount", "maximumDiscount", "usageLimit", "deliveryTime", "deliveryFee"].includes(key)) payload[key] = Number(value);
  }
  if (resource === "coupons") payload.code = payload.code.toUpperCase().trim();
  return payload;
}

function searchableValues(resource, row) {
  const common = [row.name, row.email, row.code, row.orderNumber, row.description, row.orderStatus, row.role, row.foodType, row.vehicleNumber, row.vehicleType];
  if (resource === "foods") common.push(row.restaurant?.name, row.category?.name);
  if (resource === "restaurants") common.push(row.owner?.name, row.owner?.email, ...(Array.isArray(row.cuisines) ? row.cuisines : []));
  if (resource === "delivery") common.push(row.user?.name, row.user?.email);
  if (resource === "orders") common.push(row.restaurant?.name, row.user?.name);
  return common.filter(Boolean).map(String).map((value) => value.toLowerCase());
}

export default ResourcePage;
