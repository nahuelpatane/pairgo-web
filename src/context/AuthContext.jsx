import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pairgo_user")) ?? null; }
    catch { return null; }
  });

  const login = (email, password) => {
    if (!email || !password || password.length < 4) {
      return { success: false, error: "Ingresá un email válido y contraseña (mín. 4 caracteres)." };
    }
    let profile = null;
    try { profile = JSON.parse(localStorage.getItem(`pairgo_profile_${email}`)); } catch {}
    // Demo fallback: any valid credentials work as backpacker
    if (!profile) {
      profile = { id: `u_${Date.now()}`, email, name: email.split("@")[0], role: "backpacker" };
    }
    try { localStorage.setItem("pairgo_user", JSON.stringify(profile)); } catch {}
    setUser(profile);
    return { success: true };
  };

  const signup = (data) => {
    const profile = { id: `u_${Date.now()}`, ...data };
    try {
      localStorage.setItem(`pairgo_profile_${data.email}`, JSON.stringify(profile));
      localStorage.setItem("pairgo_user", JSON.stringify(profile));
    } catch {}
    setUser(profile);
    return { success: true };
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
