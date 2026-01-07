import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../../utils/store";
import {
  User,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  LogOut,
  Camera,
  Edit2,
  Save,
  Clock,
  Shield,
  Dumbbell,
  X,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

const MemberProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Store Hooks
  const memberProfile = Store((state) => state.memberProfile);
  const profileLoading = Store((state) => state.profileLoading);
  const logout = Store((state) => state.logout);
  const getMemberProfile = Store((state) => state.getMemberProfile);
  const updateMemberProfile = Store((state) => state.updateMemberProfile);

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(""); // ✅ Added Error State

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    profile_pic: "",
  });

  useEffect(() => {
    getMemberProfile();
  }, []);

  useEffect(() => {
    if (memberProfile) {
      setFormData({
        name: memberProfile.name || "",
        email: memberProfile.email || "",
        mobile: memberProfile.mobile || "",
        profile_pic: memberProfile.profile_pic || "",
      });
      setPreviewImage(memberProfile.profile_pic || null);
    }
  }, [memberProfile]);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setError(""); // Clear error on typing
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMobileChange = (e) => {
    setError(""); // Clear error on typing
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, mobile: value });
  };

  const handleImageChange = (e) => {
    setError("");
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large (max 5MB)"); // Set local error
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, profile_pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError(""); // Clear previous errors

    // Validation
    if (formData.mobile && formData.mobile.length !== 10) {
      setError("Mobile number must be 10 digits");
      return;
    }

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);

    // API Call
    const result = await updateMemberProfile(formData);

    setIsSaving(false);

    if (result.success) {
      toast.success("Profile updated!");
      setIsEditing(false);
      setError("");
    } else {
      // ✅ Show Error Message in UI
      setError(result.message || "Failed to update profile");
      toast.error(result.message || "Failed to update");
    }
  };

  const handleCancel = () => {
    setError(""); // Clear errors on cancel
    if (memberProfile) {
      setFormData({
        name: memberProfile.name || "",
        email: memberProfile.email || "",
        mobile: memberProfile.mobile || "",
        profile_pic: memberProfile.profile_pic || "",
      });
      setPreviewImage(memberProfile.profile_pic || null);
    }
    setIsEditing(false);
  };

  const calculateProgress = () => {
    if (!memberProfile) return 0;
    const total = memberProfile.duration_months * 30;
    const remaining = memberProfile.daysRemaining || 0;
    const used = total - remaining;
    return Math.min(100, Math.max(0, (used / total) * 100));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!memberProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-4">Unable to load profile</p>
          <button
            onClick={getMemberProfile}
            className="px-6 py-2 bg-orange-500 rounded-full text-white text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24 md:pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ✅ ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium flex-1">{error}</p>
            <button
              onClick={() => setError("")}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ========== PROFILE HEADER ========== */}
        <div className="flex flex-col items-center text-center mb-8 w-full">
          {/* Avatar */}
          <div className="relative mb-5 shrink-0">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-[3px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] p-[3px]">
                <div className="w-full h-full rounded-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 hover:bg-orange-400 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
              >
                <Camera size={16} />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Name Input/Display */}
          <div className="w-full px-4">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="text-2xl font-bold text-white bg-transparent border-b-2 border-orange-500 text-center pb-1 focus:outline-none w-full max-w-[90%] mb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-1 text-center break-words w-full">
                {memberProfile.name || "Member"}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                memberProfile.status === "Active"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-400">
              {memberProfile.status || "Active"} Member
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-full border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-full border border-gray-700 text-gray-300 text-sm font-medium hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock size={18} className="text-orange-500" />
              </div>
              <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                Days Left
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {memberProfile.daysRemaining || 0}
            </p>
          </div>

          <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Dumbbell size={18} className="text-purple-500" />
              </div>
              <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                Plan
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {memberProfile.duration_months || 0}
              <span className="text-lg text-gray-500 ml-1">mo</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#111] rounded-2xl p-5 border border-gray-800/50 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Membership Progress</span>
            <span className="text-sm font-semibold text-white">
              {calculateProgress().toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>{memberProfile.start_date || "Start"}</span>
            <span>{memberProfile.end_date || "End"}</span>
          </div>
        </div>

        {/* ========== INFO CARDS ========== */}
        <div className="space-y-3">
          {/* Mobile Section */}
          <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                Phone
              </p>

              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  placeholder="Enter mobile"
                  maxLength={10}
                  className="text-white font-medium bg-transparent focus:outline-none w-full border-b border-orange-500/50 pb-0.5"
                />
              ) : (
                <p className="text-white font-medium truncate">
                  {memberProfile.mobile || "Not set"}
                </p>
              )}
            </div>
            {!isEditing && <Shield size={16} className="text-gray-600" />}
          </div>

          {/* Email Section */}
          <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                Email
              </p>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Add email"
                  className="text-white font-medium bg-transparent focus:outline-none w-full border-b border-orange-500/50 pb-0.5"
                />
              ) : (
                <p className="text-white font-medium truncate">
                  {memberProfile.email || "Not set"}
                </p>
              )}
            </div>
          </div>
          {/* D O B */}
          <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-400/10 flex items-center justify-center shrink-0">
              <Star size={18} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                Date Of Birth
              </p>
              <p className="text-white font-medium truncate">
                {memberProfile.Date_Of_Birth.split("T")[0].split("-").reverse().join("-") || "Not set"}
              </p>
            </div>
          </div>
          {/* Trainer Note */}
          {memberProfile.focus_note && (
            <div className="bg-[#111] rounded-2xl p-4 border border-gray-800/50">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Trainer's Note
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {memberProfile.focus_note}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== LOGOUT ========== */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-4 rounded-2xl border border-gray-800 text-gray-400 font-medium flex items-center justify-center gap-2 hover:border-red-500/50 hover:text-red-400 transition-all active:scale-[0.98]"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default MemberProfile;
