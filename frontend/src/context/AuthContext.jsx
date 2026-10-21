import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("foodie-token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("foodie-user") || "null");
    } catch {
      localStorage.removeItem("foodie-user");
      return null;
    }
  });
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem("foodie-token")));

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get("/auth/profile")
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem("foodie-user", JSON.stringify(data.user));
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("foodie-token");
        localStorage.removeItem("foodie-user");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, [token]);

  const context = useMemo(() => ({
    token,
    user,
    checking,
    isAuthenticated: Boolean(token && user),
    signIn: async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      if (data.user?.role !== "customer") {
        throw new Error("Please use a customer account to shop.");
      }
      localStorage.setItem("foodie-token", data.token);
      localStorage.setItem("foodie-user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    register: async (details) => {
      const { data } = await api.post("/auth/register", details);
      localStorage.setItem("foodie-token", data.token);
      localStorage.setItem("foodie-user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    updateUser: (nextUser) => {
      setUser(nextUser);
      localStorage.setItem("foodie-user", JSON.stringify(nextUser));
    },
    signOut: () => {
      localStorage.removeItem("foodie-token");
      localStorage.removeItem("foodie-user");
      setToken(null);
      setUser(null);
    },
  }), [token, user, checking]);

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}
