import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dumbbell,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Store } from "../../utils/store";

const Login = () => {
  const [formData, setFormData] = useState({ mobile: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const phone = "910000000000";
  const message = `Hi, I want to join your gym.
Please share membership plans, fees, and timings.`;

  const navigate = useNavigate();
  const location = useLocation();

  const user = Store((state) => state.user);
  const isLogging = Store((state) => state.isLogging);
  const errorMessage = Store((state) => state.errorMessage);

  const login = Store((state) => state.login);
  const clearError = Store((state) => state.clearError);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "member") {
        if (user.isFirstLogin) {
          navigate("/set-password", { replace: true });
        } else {
          const from = location.state?.from?.pathname || "/profile";
          navigate(from, { replace: true });
        }
      }
    }
  }, [user, navigate, location]);

  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mobile || !formData.password) return;

    const result = await login(formData);

    if (result?.success) {
      const loggedInUser = result.user;
      if (loggedInUser.role === "admin") navigate("/admin");
      else if (loggedInUser.isFirstLogin) navigate("/set-password");
      else navigate("/profile");
    }
  };

  return (
    <div className="w-full min-h-[100dvh] sm:min-h-screen flex items-center justify-center bg-dark-400 px-4">
      
      <div className="absolute inset-0 bg-orange-glow opacity-10 pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-dark-300 border border-dark-100 rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-neon-orange shadow-lg shadow-primary-500/20">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Sign in to access your dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-400 text-sm">
                {errorMessage}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-dark-400 text-white pl-12 pr-4 py-3 rounded-xl border border-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter your registered mobile"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-dark-400 text-white pl-12 pr-12 py-3 rounded-xl border border-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLogging}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLogging ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Not a member yet?{" "}
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                Join Now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
