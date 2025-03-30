import { createContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

// Manages authentication state and provides it to all child components
// through React Context. Initializes auth state from localStorage if available.

const AuthProvider = ({ children }) => {
  const userInfo = localStorage.getItem("userInfo");
  const [user, setUser] = useState(userInfo ? JSON.parse(userInfo) : null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      // First try Google auth
      const res = await api.get("/googleAuth/success");

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        return;
      } else {
        setUser(null);
        localStorage.removeItem("userInfo");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  };

  // Add updateUser function for manual auth
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("userInfo", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userInfo");
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []); // Remove user dependency to avoid infinite loops

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
