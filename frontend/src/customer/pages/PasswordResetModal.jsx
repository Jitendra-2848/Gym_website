// components/Auth/PasswordResetModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../../utils/store";
import { Eye, EyeOff, Lock, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const PasswordResetModal = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const navigate = useNavigate();

  // Get store values
  const user = Store((state) => state.user);
  const logout = Store((state) => state.logout);
  const updateCustomerCredential = Store((state) => state.updateCustomerCredential);

  // Check if user needs password reset (member/customer + first login)
  // Note: role can be "member" or "customer" based on your backend
  const needsPasswordReset = 
    user && 
    user.role !== "admin" && 
    user.isFirstLogin === true;

  // Handle auto logout
  const handleAutoLogout = useCallback(async () => {
    toast.error("Session expired. Please login again and reset your password.", {
      duration: 5000,
    });
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  // Countdown timer - auto logout if password not changed
  useEffect(() => {
    if (!needsPasswordReset) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [needsPasswordReset, handleAutoLogout]);

  // Reset timer when component mounts (if user comes back)
  useEffect(() => {
    if (needsPasswordReset) {
      setTimeLeft(300); // Reset to 5 minutes
    }
  }, [needsPasswordReset]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return { label: "Weak", color: "bg-red-500" };
    if (passwordStrength <= 2) return { label: "Fair", color: "bg-orange-500" };
    if (passwordStrength <= 3) return { label: "Good", color: "bg-yellow-500" };
    if (passwordStrength <= 4) return { label: "Strong", color: "bg-green-500" };
    return { label: "Very Strong", color: "bg-emerald-500" };
  };

  // Form validation
  const validateForm = () => {
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password");
      return false;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await updateCustomerCredential({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success("Password updated successfully!");

        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Navigate to profile after successful password reset
        navigate("/profile");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual logout
  const handleLogoutClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout? You will need to reset your password on next login."
    );
    if (confirmed) {
      await logout();
      navigate("/login");
    }
  };

  // Don't render if not needed
  if (!needsPasswordReset) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - Cannot be clicked to close */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-dark-100 shadow-2xl overflow-hidden">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-dark-100 p-4 sm:p-5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Password Reset Required
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Please change your password to continue
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mt-4 flex items-center justify-between bg-dark-400/50 rounded-lg px-3 sm:px-4 py-2">
            <span className="text-xs sm:text-sm text-gray-400">Auto logout in:</span>
            <span
              className={`text-base sm:text-lg font-mono font-bold ${
                timeLeft <= 60 ? "text-red-500 animate-pulse" : "text-orange-400"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-400 border border-dark-100 rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-400 border border-dark-100 rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        i < passwordStrength
                          ? getStrengthLabel().color
                          : "bg-dark-100"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-[10px] sm:text-xs ${
                    passwordStrength < 3 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  Password strength: {getStrengthLabel().label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-400 border rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500 focus:border-red-500"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-green-500 focus:border-green-500"
                    : "border-dark-100 focus:border-primary-500"
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-[10px] sm:text-xs text-red-400">
                Passwords do not match
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="mt-1 text-[10px] sm:text-xs text-green-400">
                Passwords match ✓
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-dark-400/50 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Password Requirements:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] sm:text-xs">
              <li
                className={`flex items-center gap-1 ${
                  newPassword.length >= 8 ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span>{newPassword.length >= 8 ? "✓" : "○"}</span>
                At least 8 characters
              </li>
              <li
                className={`flex items-center gap-1 ${
                  /[a-z]/.test(newPassword) ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span>{/[a-z]/.test(newPassword) ? "✓" : "○"}</span>
                One lowercase letter
              </li>
              <li
                className={`flex items-center gap-1 ${
                  /[A-Z]/.test(newPassword) ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span>{/[A-Z]/.test(newPassword) ? "✓" : "○"}</span>
                One uppercase letter
              </li>
              <li
                className={`flex items-center gap-1 ${
                  /[0-9]/.test(newPassword) ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span>{/[0-9]/.test(newPassword) ? "✓" : "○"}</span>
                One number
              </li>
              <li
                className={`flex items-center gap-1 ${
                  /[^a-zA-Z0-9]/.test(newPassword) ? "text-green-400" : "text-gray-500"
                }`}
              >
                <span>{/[^a-zA-Z0-9]/.test(newPassword) ? "✓" : "○"}</span>
                One special character
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              disabled={loading}
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-gray-300 bg-dark-400 hover:bg-dark-200 border border-dark-100 text-sm sm:text-base font-medium transition-colors disabled:opacity-50"
            >
              Logout
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-sm sm:text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;