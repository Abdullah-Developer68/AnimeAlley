import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import api from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        navigate("/"); // Redirect to home page
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0133] to-[#1a0266] px-4 py-6">
      <div className="w-full max-w-md p-4 sm:p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-white/90">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-white/70 mb-1.5 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 mb-1.5 text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm sm:text-base font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
          >
            Login
          </button>
        </form>

        <p className="mt-4 sm:mt-6 text-center text-white/40 text-xs sm:text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-pink-500 hover:text-pink-400">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
