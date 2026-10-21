import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import CustomerProviders from "./components/CustomerProviders.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CustomerProviders>
        <App />
      </CustomerProviders>
    </AuthProvider>
  </StrictMode>
);