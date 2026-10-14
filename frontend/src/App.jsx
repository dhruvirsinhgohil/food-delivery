
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
       <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Home />} />
          <Route path="/orders" element={<Home />} />
          <Route path="/wishlist" element={<Home />} />
          <Route path="/cart" element={<Home />} />
          <Route path="/login" element={<Home />} />
          <Route path="/register" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
