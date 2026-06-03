import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext({
  user: null,
  login: async () => ({ success: false, error: "No auth provider" }),
  signup: async () => ({ success: false, error: "No auth provider" }),
  logout: () => {},
  updateUser: async () => ({ success: false, error: "No auth provider" }),
});

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

  const updateUser = async (data) => {
    if (!user?.id) return { success: false, error: "Not logged in." };
    try {
      const { user: updated } = await api.patchUser(user.id, data);
      persist(updated);
      return { success: true, user: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    try { localStorage.removeItem("pairgo_user"); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
