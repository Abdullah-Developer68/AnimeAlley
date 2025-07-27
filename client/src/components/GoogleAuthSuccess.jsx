import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../Hooks/UseAuth";
import { toast } from "react-toastify";
import api from "../api/api";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      try {
        // Get token from URL query parameter
        const token = searchParams.get("token");

        if (token) {
          // Store token in localStorage
          localStorage.setItem("authToken", token);

          // Verify the token and get user data
          const res = await api.verifyAuth();

          if (res.data.success) {
            localStorage.clear();

            // Store token and user info
            localStorage.setItem("authToken", token);
            localStorage.setItem("userInfo", JSON.stringify(res.data.user));

            setUser(res.data.user);
            toast.success("Successfully logged in with Google!");
            navigate("/");
          } else {
            throw new Error("Failed to verify token");
          }
        } else {
          // Fallback: try to get user data from cookies (existing flow)
          const res = await api.googleAuthSuccess();

          if (res.data.success) {
            localStorage.clear();
            localStorage.setItem("userInfo", JSON.stringify(res.data.user));
            setUser(res.data.user);
            setTimeout(() => {
              toast.success("Successfully logged in with Google!");
            }, 1000);

            navigate("/");
          } else {
            throw new Error("Google authentication failed");
          }
        }
      } catch (error) {
        console.error("Google auth success error:", error);
        toast.error("Google authentication failed. Please try again.");
        navigate("/login");
      }
    };

    handleGoogleAuthSuccess();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-transparent">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">
          Completing Google authentication...
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
