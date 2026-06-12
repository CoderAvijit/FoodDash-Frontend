import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, loadAuth, saveAuth } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth());

  const apply = useCallback((data) => {
    const next = data
      ? {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          name: data.name,
          role: data.role,
        }
      : null;
    saveAuth(next);
    setAuth(next);
  }, []);

  const login = useCallback(
    async (phone, password) => {
      const { data } = await api.post("/auth/login", { phone, password });
      apply(data);
      return data;
    },
    [apply]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      apply(data);
      return data;
    },
    [apply]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    apply(null);
  }, [apply]);

  // If a token refresh fails anywhere, drop the session.
  useEffect(() => {
    const onLogout = () => apply(null);
    window.addEventListener("fooddash:logout", onLogout);
    return () => window.removeEventListener("fooddash:logout", onLogout);
  }, [apply]);

  return (
    <AuthContext.Provider value={{ auth, isAuthed: !!auth, role: auth?.role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
