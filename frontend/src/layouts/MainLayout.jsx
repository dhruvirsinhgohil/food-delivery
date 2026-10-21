
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="main-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;
