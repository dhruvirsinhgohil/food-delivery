import { useEffect, useMemo, useState } from "react";
import api from "./api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem("food-admin-token")));

  useEffect(() => {
    const token = localStorage.getItem("food-admin-token");
    if (!token) return;

    api.get("/auth/profile")
      .then(({ data }) => {
        if (data.user?.role !== "admin") {
          throw new Error("This account does not have administrator access.");
        }
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("food-admin-token");
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const value = useMemo(() => ({
    user,
    checking,
    signIn: async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.user?.role !== "admin") {
        throw new Error("This account does not have administrator access.");
      }
      localStorage.setItem("food-admin-token", data.token);
      setUser(data.user);
    },
    signOut: () => {
      localStorage.removeItem("food-admin-token");
      setUser(null);
    },
  }), [user, checking]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
