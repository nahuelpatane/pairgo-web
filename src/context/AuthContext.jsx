import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pairgo_user")) ?? null; }
    catch { return null; }
  });

  const persist = (u) => {
    try { localStorage.setItem("pairgo_user", JSON.stringify(u)); } catch {}
    setUser(u);
  };

  const login = async (email, password) => {
    if (!email || !password || password.length < 4) {
      return { success: false, error: "Ingresá un email válido y contraseña (mín. 4 caracteres)." };
    }
    try {
      const { user } = await api.login(email, password);
      persist(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (data) => {
    try {
      const { user } = await api.signup(data);
      persist(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    try { localStorage.removeItem("pairgo_user"); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
