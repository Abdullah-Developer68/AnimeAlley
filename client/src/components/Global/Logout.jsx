import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/UseAuth";
import api from "../../api/api";
import { toast } from "react-toastify";

const Logout = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.clear(); // Clear all local storage data
      if (user.googleId) {
        // Google OAuth logout
        api.googleLogout();
      } else {
        // Regular auth logout
        await api.logout();
        setUser(null); // Clear user state for making routes protected again
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-black bg-red-500 px-2 py-1 md:px-3 md:py-2 rounded-md cursor-pointer text-sm md:text-base"
    >
      Logout
    </button>
  );
};

export default Logout;
