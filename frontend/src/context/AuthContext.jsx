import { createContext, useContext, useEffect, useState } from "react";

const AuthCOntext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthCOntext.Provider
      value={{ token, login, logout, isAuthenticated: !!token }}
    >
      {!loading && children}
    </AuthCOntext.Provider>
  );
}

export const useAuth = () => useContext(AuthCOntext);
