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
    // Log device info for debugging
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    console.log("Auth check - Device type:", isMobile ? "Mobile" : "Desktop");
    console.log("Auth check - User Agent:", navigator.userAgent);

    try {
      // First try verifying JWT token works for both normal and Google auth
      const res = await api.verifyAuth();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        return;
      }

      // If JWT verification fails, try Google auth
      const googleRes = await api.googleAuthSuccess();
      if (googleRes.data.success) {
        setUser(googleRes.data.user);
        localStorage.setItem("userInfo", JSON.stringify(googleRes.data.user));
        return;
      }

      // If both fail, clear any invalid data and set user to null
      setUser(null);
      localStorage.removeItem("userInfo");
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token is invalid/expired, clear stored data
        console.log("Token expired or invalid, clearing auth data");
        setUser(null);
        localStorage.removeItem("userInfo");
      } else {
        console.error("Auth check error:", error);
        console.error("Auth check error details:", {
          status: error.response?.status,
          data: error.response?.data,
          isMobile,
        });
        setUser(null);
      }
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
    // Only check auth if we have stored user data or if we're loading for the first time
    if (userInfo || loading) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
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
