import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => ({ success: false }),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const { user } = await api.login(email, password);
      setUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (data) => {
    try {
      const { user } = await api.signup(data);
      setUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (data) => {
    if (!user?.id) return { success: false, error: 'Not logged in.' };
    try {
      const { user: updated } = await api.patchUser(user.id, data);
      setUser(updated);
      return { success: true, user: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
