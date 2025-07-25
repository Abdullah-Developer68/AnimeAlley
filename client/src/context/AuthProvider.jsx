import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
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
      // First try verifying JWT token works for both normal and Google auth
      const res = await api.googleAuthVerify();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        return;
      }

      // If JWT verification fails, try Google auth
      const googleRes = await api.googleAuthSuccess();
      console.log("Google login response:", googleRes.data);
      if (googleRes.data.success) {
        setUser(googleRes.data.user);
        localStorage.setItem("userInfo", JSON.stringify(googleRes.data.user));
        return;
      }

      setUser(null);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  // update the user when it changes for manual auth
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

// prop validation
AuthProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export { AuthProvider, AuthContext };
