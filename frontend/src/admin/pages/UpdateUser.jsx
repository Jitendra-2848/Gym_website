import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit, CheckCircle, AlertCircle, ArrowLeft, Plus, Camera, X,
  RefreshCw, Trash2, AlertTriangle, User, Upload, Ban, UserCheck,
  Lock, Eye, EyeOff, Key, Shield, Calendar, Clock, Sparkles, Tag,
} from "lucide-react";
import { Store } from "../../utils/store";
import { encryptPassword } from "../../utils/crypto";
import RenewalModal from "../components/RenewalModal";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// Helper Functions
const compressImage = (base64, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64);
  });
};

const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const formatDate = (dateStr) => {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ✅ FIXED: Moved DateInput OUTSIDE the main component
const DateInput = ({ label, value, onChange, min, max, disabled = false }) => {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (inputRef.current?.showPicker) {
      try {
        inputRef.current.showPicker();
      } catch {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div>
      {label && <label className="text-gray-400 text-xs mb-1 block">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className={`input-dark w-full pr-10 ${disabled ? "opacity-60" : ""}`}
          style={{ colorScheme: "dark" }}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <Calendar size={18} />
        </button>
      </div>
    </div>
  );
};

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Store
  const { userList, getAllUser, updateUser, cancelUserMembership, priceFun, pricing: pricingFromStore } = Store();

  // States
  const [pricingList, setPricingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Camera
  const [camera, setCamera] = useState({ hasCamera: false, isOpen: false, stream: null, facingMode: "user" });

  // Photo
  const [photo, setPhoto] = useState({ preview: null, base64: null });

  // Form
  const [form, setForm] = useState({
    name: "", mobile: "", email: "", startDate: "", endDate: "",
    focusNote: "", dateOfBirth: "", changePassword: false,
    newPassword: "", showPassword: false, monthsToAdd: 0,
    applyDiscount: false, discountAmount: 0,
  });

  const member = userList.find((m) => m._id === id);
  const isCancelled = member?.iscancel === true;

  // Update form helper
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Fetch data on mount
  useEffect(() => {
    const init = async () => {
      setFetching(true);
      if (priceFun) await priceFun();
      await getAllUser();
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCamera((c) => ({ ...c, hasCamera: devices.some((d) => d.kind === "videoinput") }));
      } catch { /* ignore */ }
      setFetching(false);
    };
    init();
  }, [id, priceFun, getAllUser]);

  // Update pricing list
  useEffect(() => {
    if (pricingFromStore?.length > 0) setPricingList(pricingFromStore);
  }, [pricingFromStore]);

  // Populate form when member loads
  useEffect(() => {
    if (member) {
      setForm((prev) => ({
        ...prev,
        name: member.name || "",
        mobile: member.mobile || "",
        email: member.email || "",
        startDate: member.start_date?.split("T")[0] || "",
        endDate: member.end_date?.split("T")[0] || "",
        dateOfBirth: member.Date_Of_Birth?.split("T")[0] || "",
        focusNote: member.focus_note || "",
        applyDiscount: parseFloat(member.discount) > 0,
        discountAmount: parseFloat(member.discount) || 0,
      }));
      setPhoto({ preview: member.profile_pic || null, base64: null });
    }
  }, [member]);

  // Cleanup camera
  useEffect(() => {
    return () => camera.stream?.getTracks().forEach((t) => t.stop());
  }, [camera.stream]);

  // Calculate renewal
  const calculateRenewal = () => {
    const months = parseInt(form.monthsToAdd) || 0;
    if (months === 0 || !pricingList.length) {
      return { subTotal: 0, finalTotal: 0, pricePerMonth: 0, newEndDate: "", newStartDate: "", actionType: "renewal" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentEnd = form.endDate ? new Date(form.endDate) : today;
    currentEnd.setHours(0, 0, 0, 0);

    const isFreshStart = currentEnd < today || isCancelled;
    const effectiveStartDate = isFreshStart ? today : currentEnd;
    const calculatedEndDate = new Date(effectiveStartDate);
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + months);

    const plan = pricingList.find((p) => p.months === months);
    if (!plan) return { subTotal: 0, finalTotal: 0, newEndDate: "", pricePerMonth: 0 };

    const subTotal = Number(plan.price);
    const discount = form.applyDiscount ? parseFloat(form.discountAmount) || 0 : 0;

    return {
      subTotal,
      finalTotal: Math.max(0, subTotal - discount),
      newStartDate: effectiveStartDate.toISOString(),
      newEndDate: calculatedEndDate.toISOString().split("T")[0],
      actionType: isFreshStart ? "renewal" : "extension",
      pricePerMonth: Math.round(subTotal / months),
    };
  };

  const renewal = calculateRenewal();

  // Photo handlers
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowPhotoOptions(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const compressed = await compressImage(event.target.result);
      setPhoto({ preview: compressed, base64: compressed });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto({ preview: member?.profile_pic || null, base64: null });
    setShowPhotoOptions(false);
  };

  // Camera handlers
  const openCamera = async (mode = "user") => {
    try {
      camera.stream?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setCamera({ ...camera, stream, facingMode: mode, isOpen: true });
      setShowPhotoOptions(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError("Cannot access camera");
    }
  };

  const stopCamera = () => {
    camera.stream?.getTracks().forEach((t) => t.stop());
    setCamera({ ...camera, stream: null, isOpen: false });
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const maxSize = 400;
    const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight, 1);
    canvas.width = video.videoWidth * ratio;
    canvas.height = video.videoHeight * ratio;
    const ctx = canvas.getContext("2d");
    if (camera.facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    setPhoto({ preview: base64, base64 });
    stopCamera();
  };

  // Submit handlers
  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Name is required");
    if (!form.mobile.trim() || form.mobile.length !== 10) return setError("Valid 10-digit mobile is required");
    if (form.changePassword && form.newPassword.length < 4) return setError("Password must be at least 4 characters");

    if (parseInt(form.monthsToAdd) > 0) {
      setShowRenewalModal(true);
      return;
    }
    await executeUpdate();
  };

  const executeUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const updateData = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        focus_note: form.focusNote.trim(),
        start_date: form.startDate,
        end_date: parseInt(form.monthsToAdd) > 0 ? renewal.newEndDate : form.endDate,
        discount: form.applyDiscount ? form.discountAmount : 0,
        Date_Of_Birth: form.dateOfBirth,
      };

      if (parseInt(form.monthsToAdd) > 0) updateData.duration_months = parseInt(form.monthsToAdd);
      if (photo.base64) updateData.profile_pic = photo.base64;
      if (isCancelled && parseInt(form.monthsToAdd) > 0) updateData.iscancel = false;

      if (form.changePassword && form.newPassword) {
        const encrypted = encryptPassword(form.newPassword);
        if (encrypted) {
          updateData.encryptedPassword = encrypted;
          updateData.resetPassword = true;
        }
      }

      const result = await updateUser(id, updateData);

      if (result?.success) {
        setSuccess(true);
        setShowRenewalModal(false);
        updateForm("changePassword", false);
        updateForm("newPassword", "");
        await getAllUser();
        setTimeout(() => navigate("/admin/list"), 1500);
      } else {
        setError(result?.message || "Update failed");
        setShowRenewalModal(false);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Server error");
      setShowRenewalModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelUserMembership(id);
      if (result?.success) {
        await getAllUser();
        navigate("/admin/list");
      } else {
        setError(result?.message || "Failed to cancel");
      }
    } catch {
      setError("Error cancelling");
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  // Render helpers
  const renderPlanCard = (plan, isForCancelled = false) => {
    const isSelected = parseInt(form.monthsToAdd) === plan.months;
    const monthlyRate = Math.round(Number(plan.price) / plan.months);
    const isPopular = plan.months === 3 || plan.months === 6;
    const color = isForCancelled ? "green" : "primary";

    return (
      <button
        key={plan.months}
        type="button"
        onClick={() => updateForm("monthsToAdd", isSelected && !isForCancelled ? 0 : plan.months)}
        className={`relative p-4 rounded-xl border-2 text-center transition-all ${
          isSelected
            ? `border-${color}-500 bg-${color}-500/10 shadow-lg shadow-${color}-500/20`
            : "border-dark-100 bg-dark-200 hover:border-gray-600"
        }`}
      >
        {isPopular && !isSelected && !isForCancelled && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center gap-1">
            <Sparkles size={10} /> Popular
          </div>
        )}
        {isSelected && (
          <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${color}-500 rounded-full flex items-center justify-center`}>
            <CheckCircle size={14} className="text-white" />
          </div>
        )}
        <div className={`text-lg font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>{plan.months}</div>
        <div className={`text-xs ${isSelected ? `text-${color}-300` : "text-gray-500"}`}>
          {plan.months === 1 ? "Month" : "Months"}
        </div>
        <div className={`text-xl font-bold mt-2 ${isSelected ? `text-${color}-400` : "text-white"}`}>₹{plan.price}</div>
        <div className="text-[10px] mt-1 text-gray-500">~₹{monthlyRate}/mo</div>
      </button>
    );
  };

  // Loading
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not Found
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <User size={64} className="mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Member Not Found</h2>
        <button onClick={() => navigate("/admin/list")} className="btn-primary">Back</button>
      </div>
    );
  }

  // Renewal Modal Props
  const renewalModalProps = {
    isOpen: showRenewalModal,
    onClose: () => setShowRenewalModal(false),
    onConfirm: executeUpdate,
    memberData: { name: form.name, mobile: form.mobile, email: form.email },
    renewalData: {
      duration: form.monthsToAdd,
      pricePerMonth: renewal.pricePerMonth,
      subTotal: renewal.subTotal,
      finalTotal: renewal.finalTotal,
      discount: form.applyDiscount ? form.discountAmount : 0,
      newStartDate: renewal.newStartDate,
      newEndDate: renewal.newEndDate,
      actionType: renewal.actionType,
      previousEndDate: form.endDate,
    },
    photoPreview: photo.preview,
    loading,
  };

  // Cancelled View
  if (isCancelled) {
    return (
      <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
          <Ban className="text-red-500" size={24} />
          <div>
            <span className="text-red-400 font-bold">Membership Cancelled</span>
            <p className="text-red-300/70 text-sm">Select a plan to reactivate.</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg">Reactivated!</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-dark p-6 flex items-center gap-4">
              <img src={photo.preview || DEFAULT_AVATAR} className="w-20 h-20 rounded-full object-cover" alt="" />
              <div>
                <h2 className="text-xl font-bold text-white">{form.name}</h2>
                <p className="text-gray-400">{form.mobile}</p>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="text-green-500" /> Select Plan to Reactivate
              </h3>
              {pricingList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Loading plans...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pricingList.map((plan) => renderPlanCard(plan, true))}
                </div>
              )}
            </div>
          </div>

          <div className="card-dark p-6 border-t-4 border-green-500">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            {parseInt(form.monthsToAdd) > 0 ? (
              <>
                <div className="flex justify-between text-gray-400 mb-2">
                  <span>Total</span>
                  <span className="text-green-400 font-bold text-xl">₹{renewal.finalTotal}</span>
                </div>
                <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl mt-4 disabled:opacity-50 font-bold">
                  {loading ? "Processing..." : "Reactivate Member"}
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">Select a plan</p>
            )}
          </div>
        </div>

        <RenewalModal {...renewalModalProps} />
      </div>
    );
  }

  // Normal View
  return (
    <div className="max-w-6xl mx-auto pt-6 pb-12 px-4">
      {/* Camera Modal */}
      {camera.isOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <h3 className="text-white font-bold">Take Photo</h3>
            <button onClick={stopCamera} className="p-2 text-white"><X size={24} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
              style={{ transform: camera.facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
          </div>
          <div className="p-6 bg-black/50 flex items-center justify-center gap-8">
            <button onClick={() => openCamera(camera.facingMode === "user" ? "environment" : "user")} className="p-4 bg-white/20 rounded-full text-white">
              <RefreshCw size={24} />
            </button>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-primary-500" />
            </button>
            <button onClick={stopCamera} className="p-4 bg-red-500/50 rounded-full text-white"><X size={24} /></button>
          </div>
        </div>
      )}

      <RenewalModal {...renewalModalProps} />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-200 p-6 rounded-2xl max-w-sm w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Cancel Membership?</h3>
            <p className="text-gray-400 mb-6">This will deactivate {form.name}'s account.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-dark-300 text-gray-300 rounded-xl">No</button>
              <button onClick={handleCancel} disabled={loading} className="flex-1 py-3 bg-red-600 text-white rounded-xl">
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Edit className="text-primary-500" /> Update Member
      </h1>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> Updated Successfully!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="text-primary-500" /> Personal Details
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-full bg-dark-300 overflow-hidden cursor-pointer border-2 border-dashed border-gray-600 hover:border-primary-500 transition"
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  >
                    <img src={photo.preview || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="" />
                  </div>
                  {photo.base64 && (
                    <button onClick={removePhoto} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-2">Tap to change</span>
                {showPhotoOptions && (
                  <div className="mt-2 bg-dark-200 rounded-xl border border-dark-100 overflow-hidden w-40 shadow-xl z-10">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 px-4 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2">
                      <Upload size={16} /> Upload Photo
                    </button>
                    {camera.hasCamera && (
                      <button onClick={() => openCamera("user")} className="w-full py-3 px-4 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2">
                        <Camera size={16} /> Take Photo
                      </button>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                  <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="input-dark w-full" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Mobile *</label>
                    <input value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value)} className="input-dark w-full" maxLength={10} placeholder="10 digits" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Email</label>
                    <input value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="input-dark w-full" placeholder="Optional" />
                  </div>
                  
                  {/* ✅ FIXED: Now works properly because DateInput is outside component */}
                  <DateInput
                    label="Date of Birth"
                    value={form.dateOfBirth}
                    onChange={(value) => updateForm("dateOfBirth", value)}
                    max={getTodayString()}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Focus / Notes</label>
                  <input value={form.focusNote} onChange={(e) => updateForm("focusNote", e.target.value)} className="input-dark w-full" placeholder="e.g., Weight loss" />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-yellow-500" /> Security
            </h3>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.changePassword}
                onChange={(e) => {
                  updateForm("changePassword", e.target.checked);
                  if (!e.target.checked) {
                    updateForm("newPassword", "");
                    updateForm("showPassword", false);
                  }
                }}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.changePassword ? "bg-yellow-500 border-yellow-500" : "border-gray-600"}`}>
                {form.changePassword && <CheckCircle size={14} className="text-black" />}
              </div>
              <div>
                <span className="text-white font-medium">Reset Password</span>
                <p className="text-gray-500 text-xs">Set a new password for this member</p>
              </div>
            </label>

            {form.changePassword && (
              <div className="mt-4 p-4 bg-dark-400/50 rounded-xl border border-yellow-500/20 space-y-4">
                <div className="flex items-center gap-2 text-yellow-500/80 text-sm">
                  <Shield size={16} /><span>Password will be encrypted before sending</span>
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={form.showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => updateForm("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    className="input-dark w-full pl-12 pr-12"
                    minLength={4}
                  />
                  <button type="button" onClick={() => updateForm("showPassword", !form.showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {form.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { updateForm("newPassword", generatePassword()); updateForm("showPassword", true); }}
                    className="px-4 py-2 bg-yellow-600/20 text-yellow-500 rounded-lg text-sm font-medium hover:bg-yellow-600/30 flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Generate Random
                  </button>
                  {form.newPassword && (
                    <span className={`text-sm ${form.newPassword.length >= 4 ? "text-green-500" : "text-red-500"}`}>
                      {form.newPassword.length >= 4 ? "✓ Valid" : `${4 - form.newPassword.length} more chars needed`}
                    </span>
                  )}
                </div>
                {form.newPassword && form.showPassword && (
                  <div className="p-3 bg-dark-300 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">New Password:</p>
                    <p className="text-white font-mono text-lg tracking-wider select-all">{form.newPassword}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extend Membership */}
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-primary-500" /> Extend Membership
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-gray-500" />
                <span className="text-gray-400">Expires:</span>
                <span className="text-white font-medium">{formatDate(form.endDate)}</span>
              </div>
            </div>

            {pricingList.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />Loading plans...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {pricingList.map((plan) => renderPlanCard(plan))}
                </div>

                {parseInt(form.monthsToAdd) === 0 && (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed border-dark-100 rounded-xl">
                    <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                    <p className="text-sm">Select a plan above to extend membership</p>
                  </div>
                )}

                {parseInt(form.monthsToAdd) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <Calendar className="text-primary-400" size={20} />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">New End Date</p>
                          <p className="text-white font-bold">{formatDate(renewal.newEndDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Extension</p>
                        <p className="text-primary-400 font-bold">+{form.monthsToAdd} month(s)</p>
                      </div>
                    </div>

                    <div className="p-4 bg-dark-300/50 rounded-xl border border-dark-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.applyDiscount} onChange={(e) => updateForm("applyDiscount", e.target.checked)} className="sr-only" />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.applyDiscount ? "bg-green-500 border-green-500" : "border-gray-600"}`}>
                          {form.applyDiscount && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-green-500" /><span className="text-white font-medium">Apply Discount</span>
                        </div>
                      </label>

                      {form.applyDiscount && (
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-gray-400">Amount:</span>
                          <div className="relative flex-1 max-w-[150px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={form.discountAmount}
                              onChange={(e) => updateForm("discountAmount", e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="input-dark w-full pl-8"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          {form.discountAmount > 0 && <span className="text-green-400 text-sm font-medium">-₹{form.discountAmount} off</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-dark p-6 sticky top-6 border-t-4 border-primary-500">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>

            {parseInt(form.monthsToAdd) > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Plan</span>
                    <span className="text-white font-bold">{form.monthsToAdd} Month(s)</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500 text-sm">Rate</span>
                    <span className="text-primary-400 text-sm">~₹{renewal.pricePerMonth}/mo</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span>₹{renewal.subTotal}</span>
                  </div>
                  {form.applyDiscount && form.discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1"><Tag size={12} /> Discount</span>
                      <span>-₹{form.discountAmount}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-gray-700">
                  <span>Total</span><span className="text-primary-400">₹{renewal.finalTotal}</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 text-gray-400">
                  <span>New End Date</span><span className="text-white">{formatDate(renewal.newEndDate)}</span>
                </div>

                {form.changePassword && form.newPassword && (
                  <div className="flex items-center gap-2 text-yellow-500 text-sm pt-2">
                    <Lock size={14} /><span>Password will be reset</span>
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl mt-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><RefreshCw size={18} className="animate-spin" /> Processing...</> : <><CheckCircle size={18} /> Confirm Update</>}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-center mb-4">No extension selected</p>
                {form.changePassword && form.newPassword && (
                  <div className="flex items-center gap-2 text-yellow-500 text-sm mb-4 justify-center">
                    <Lock size={14} /><span>Password will be reset</span>
                  </div>
                )}
                <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 font-medium">
                  {loading ? "Saving..." : "Update Member"}
                </button>
              </div>
            )}

            <button onClick={() => setShowCancelModal(true)} className="w-full py-3 mt-6 border border-red-900 text-red-500 rounded-xl hover:bg-red-900/20 flex items-center justify-center gap-2">
              <Trash2 size={16} /> Cancel Membership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;