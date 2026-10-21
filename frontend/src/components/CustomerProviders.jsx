import { CartProvider } from "../context/CartContext";
import { useAuth } from "../context/useAuth";

function CustomerProviders({ children }) {
  const { token } = useAuth();
  return <CartProvider key={token || "guest"}>{children}</CartProvider>;
}

export default CustomerProviders;
