import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  loading: true,
  restoredSession: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);
