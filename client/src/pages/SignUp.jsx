import { useForm } from "react-hook-form";
import assests from "../assets/asset";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import useAuth from "../Hooks/UseAuth";

const Signup = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onsubmit = async (data) => {
    try {
      console.log("Sending signup data:", data);
      const res = await api.post("/auth/signup", data);
      console.log("Signup res:", res.data);

      if (res.data.success) {
        // Update auth context with user data
        setUser(res.data.user);
        // Store in localStorage if needed
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        // Navigate to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", {
        message: error.res?.data?.message || error.message,
        status: error.res?.status,
      });
    }
  };

  const handleGoogleLogin = () => {
    api.googleLogin();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0133] to-[#1a0266] px-4 py-6 mt-10">
        <div className="w-full max-w-md p-4 sm:p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
          {/* Header - Reduced size on mobile */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-white/90">
            Sign Up
          </h2>

          <form
            onSubmit={handleSubmit(onsubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Input Fields - Reduced padding on mobile */}
            <div>
              <label className="block text-white/70 mb-1.5 text-sm">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Enter your username"
                {...register("username", {
                  required: "Username is required!",
                })}
              />
              {errors.username && (
                <span className="text-pink-500 text-xs sm:text-sm mt-1">
                  {errors.username.message}
                </span>
              )}
            </div>

            {/* Email field - Similar compact styling */}
            <div>
              <label className="block text-white/70 mb-1.5 text-sm">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required!" })}
              />
              {errors.email && (
                <span className="text-pink-500 text-xs sm:text-sm mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password field - Similar compact styling */}
            <div>
              <label className="block text-white/70 mb-1.5 text-sm">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              {errors.password && (
                <span className="text-pink-500 text-xs sm:text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button - Adjusted padding */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm sm:text-base font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          {/* Divider - Reduced margins */}
          <div className="relative mt-6 mb-4 sm:mt-8 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 text-white/40 bg-gradient-to-b from-[#0b0133] to-[#1a0266]">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}

          <button
            className="w-full py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm sm:text-base hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <img src={assests.google} className="w-6" />
            Sign Up with Google
          </button>

          {/* Login Link - Reduced margin and text size */}
          <p className="mt-4 sm:mt-6 text-center text-white/40 text-xs sm:text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-pink-500 hover:text-pink-400">
              Log In
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
