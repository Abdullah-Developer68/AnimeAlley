import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/UseAuth";
import api from "../api/api";
import { toast } from "react-toastify";

const Login = () => {
  // using cutom hook for auth
  const { setUser } = useAuth();
  // to navigate
  const navigate = useNavigate();
  // form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const localLogin = async (data) => {
    console.log(data);
    try {
      const res = await api.post("/auth/login", data);

      if (res.data.success) {
        localStorage.clear();
        setUser(res.data.user);
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred!");
      console.error("Login error:", {
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }
  };

  const handleGoogleLogin = async () => {
    api.googleLogin();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-6 mt-10">
        <div className="w-full max-w-md p-4 sm:p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-white/90">
            Log In
          </h2>

          {/* Trial Account Info */}
          <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300/80 text-center">
              <span className="font-medium text-blue-400">Demo Account:</span>{" "}
              trailAdmin@gmail.com
            </p>
            <p className="text-sm text-blue-300/80 text-center">
              <span className="font-medium text-blue-400">Password:</span>{" "}
              12345678
            </p>
          </div>

          <form
            onSubmit={handleSubmit(localLogin)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-white/70 text-sm">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-pink-500 text-sm hover:text-pink-400"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required!",
                })}
              />
              {errors.password && (
                <span className="text-pink-500 text-xs sm:text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg bg-pink-500 text-black text-sm sm:text-base font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Divider */}
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

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm sm:text-base hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-4 sm:mt-6 text-center text-white/40 text-xs sm:text-sm">
            Do not have an account?{" "}
            <Link to="/signup" className="text-pink-500 hover:text-pink-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
