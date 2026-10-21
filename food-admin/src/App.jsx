import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./useAuth";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ResourcePage from "./pages/ResourcePage";
import Login from "./pages/Login";

function App() {
  const { user, checking } = useAuth();
  const [notice, setNotice] = useState(null);

  if (checking) {
    return <div className="screen-loader"><span className="loader" />Loading your workspace…</div>;
  }

  if (!user) return <Login />;

  return (
    <AdminLayout notice={notice} onDismissNotice={() => setNotice(null)}>
      <Routes>
        <Route path="/" element={<Dashboard onNotice={setNotice} />} />
        <Route path="/restaurants" element={<ResourcePage resource="restaurants" onNotice={setNotice} />} />
        <Route path="/foods" element={<ResourcePage resource="foods" onNotice={setNotice} />} />
        <Route path="/categories" element={<ResourcePage resource="categories" onNotice={setNotice} />} />
        <Route path="/orders" element={<ResourcePage resource="orders" onNotice={setNotice} />} />
        <Route path="/customers" element={<ResourcePage resource="customers" onNotice={setNotice} />} />
        <Route path="/coupons" element={<ResourcePage resource="coupons" onNotice={setNotice} />} />
        <Route path="/delivery" element={<ResourcePage resource="delivery" onNotice={setNotice} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;
