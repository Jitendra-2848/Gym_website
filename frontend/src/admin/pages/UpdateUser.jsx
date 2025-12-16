import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit, CheckCircle, AlertCircle, ArrowLeft, Plus, Camera, X, RefreshCw,
  Trash2, AlertTriangle, User, Upload, Ban, UserCheck,
  Lock, Eye, EyeOff, Key, Shield, Calendar, Clock, Sparkles, Tag
} from "lucide-react";
import { Store } from "../../utils/store";
import { encryptPassword } from "../../utils/crypto";
import RenewalModal from "../components/RenewalModal";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// Compress Image Helper
const compressImage = (base64, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64);
  });
};

// Generate Random Password
const generatePassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Zustand Store
  const userList = Store((s) => s.userList);
  const getAllUser = Store((s) => s.getAllUser);
  const updateUser = Store((s) => s.updateUser);
  const cancelUserMembership = Store((s) => s.cancelUserMembership);
  const priceFun = Store((s) => s.priceFun);
  const pricingFromStore = Store((s) => s.pricing);

  // Local pricing state
  const [pricingList, setPricingList] = useState([]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Camera
  const [hasCamera, setHasCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  // Photo
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [focusNote, setFocusNote] = useState("");

  // Password Change
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Renewal
  const [monthsToAdd, setMonthsToAdd] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const member = userList.find((m) => m._id === id);
  const isCancelled = member?.iscancel === true;

  // Fetch Pricing & Users on Mount
  useEffect(() => {
    const init = async () => {
      setFetching(true);
      if (priceFun) await priceFun();
      await getAllUser();
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasCamera(devices.some((d) => d.kind === "videoinput"));
      } catch {
        setHasCamera(false);
      }
      setFetching(false);
    };
    init();
  }, [id]);

  // Update local pricing when store changes
  useEffect(() => {
    if (pricingFromStore && pricingFromStore.length > 0) {
      setPricingList(pricingFromStore);
    }
  }, [pricingFromStore]);

  // Populate Form when member loads
  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setMobile(member.mobile || "");
      setEmail(member.email || "");
      setStartDate(member.start_date ? member.start_date.split("T")[0] : "");
      setEndDate(member.end_date ? member.end_date.split("T")[0] : "");
      setFocusNote(member.focus_note || "");
      setPhotoPreview(member.profile_pic || null);

      const existingDiscount = parseFloat(member.discount) || 0;
      if (existingDiscount > 0) {
        setApplyDiscount(true);
        setDiscountAmount(existingDiscount);
      } else {
        setApplyDiscount(false);
        setDiscountAmount(0);
      }
    }
  }, [member]);

  // Cleanup Camera
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // ==========================================
  // ⚡ FIXED RENEWAL LOGIC
  // ==========================================
  const calculateRenewal = () => {
    const months = parseInt(monthsToAdd) || 0;
    
    // Return empty if no months selected
    if (months === 0 || pricingList.length === 0) {
      return { 
        subTotal: 0, finalTotal: 0, pricePerMonth: 0, 
        newEndDate: "", newStartDate: "", actionType: "renewal" 
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine Current Status
    const currentEnd = endDate ? new Date(endDate) : today;
    currentEnd.setHours(0, 0, 0, 0); // Normalize time
    
    // Check if membership is currently expired or cancelled
    const isExpired = currentEnd < today;
    const isFreshStart = isExpired || isCancelled;

    // --- KEY LOGIC: START DATE ---
    // If Active: Start from existing end date (Extension)
    // If Expired/Cancelled: Start from Today (Fresh Renewal)
    const effectiveStartDate = isFreshStart ? today : currentEnd;

    // --- KEY LOGIC: NEW END DATE ---
    // Add months to the effective start date
    const calculatedEndDate = new Date(effectiveStartDate);
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + months);

    // Pricing
    const plan = pricingList.find((p) => p.months === months);
    if (!plan) {
      return { subTotal: 0, finalTotal: 0, newEndDate: "", pricePerMonth: 0 };
    }

    const subTotal = Number(plan.price);
    const pricePerMonth = Math.round(subTotal / months);
    const discount = applyDiscount ? parseFloat(discountAmount) || 0 : 0;

    return {
      subTotal,
      finalTotal: Math.max(0, subTotal - discount),
      
      // Pass these to Modal/Backend
      newStartDate: effectiveStartDate.toISOString(), 
      newEndDate: calculatedEndDate.toISOString().split("T")[0],
      actionType: isFreshStart ? 'renewal' : 'extension',
      
      pricePerMonth,
    };
  };

  const renewal = calculateRenewal();

  // Photo Handlers
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowPhotoOptions(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      const compressed = await compressImage(base64, 400, 0.7);
      setPhotoPreview(compressed);
      setPhotoBase64(compressed);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(member?.profile_pic || null);
    setPhotoBase64(null);
    setShowPhotoOptions(false);
  };

  // Camera Handlers
  const openCamera = async (mode = "user") => {
    try {
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setVideoStream(stream);
      setFacingMode(mode);
      setIsCameraOpen(true);
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

  const switchCamera = () => openCamera(facingMode === "user" ? "environment" : "user");

  const stopCamera = () => {
    if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const maxSize = 400;
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (width > height && width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    } else if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    setPhotoPreview(base64);
    setPhotoBase64(base64);
    stopCamera();
  };

  // Generate Password
  const handleGeneratePassword = () => {
    const pwd = generatePassword(8);
    setNewPassword(pwd);
    setShowPassword(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      setError("Valid 10-digit mobile is required");
      return;
    }
    if (changePassword && newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (parseInt(monthsToAdd) > 0) {
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
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        focus_note: focusNote.trim(),
        start_date: startDate,
        end_date: parseInt(monthsToAdd) > 0 ? renewal.newEndDate : endDate,
        discount: applyDiscount ? discountAmount : 0,
      };

      if (parseInt(monthsToAdd) > 0) {
        updateData.duration_months = parseInt(monthsToAdd);
      }

      if (photoBase64) {
        updateData.profile_pic = photoBase64;
      }

      if (isCancelled && parseInt(monthsToAdd) > 0) {
        updateData.iscancel = false;
      }

      if (changePassword && newPassword) {
        const encrypted = encryptPassword(newPassword);
        if (encrypted) {
          updateData.encryptedPassword = encrypted;
          updateData.resetPassword = true;
        }
      }

      const result = await updateUser(id, updateData);

      if (result?.success) {
        setSuccess(true);
        setShowRenewalModal(false);
        setChangePassword(false);
        setNewPassword("");
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

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading State
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

  // === CANCELLED VIEW ===
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
              <img src={photoPreview || DEFAULT_AVATAR} className="w-20 h-20 rounded-full object-cover" alt="" />
              <div>
                <h2 className="text-xl font-bold text-white">{name}</h2>
                <p className="text-gray-400">{mobile}</p>
              </div>
            </div>

            {/* Plan Selection Cards for Cancelled */}
            <div className="card-dark p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="text-green-500" /> Select Plan to Reactivate
              </h3>

              {pricingList.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Loading plans...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pricingList.map((plan) => {
                    const isSelected = parseInt(monthsToAdd) === plan.months;
                    const monthlyRate = Math.round(Number(plan.price) / plan.months);

                    return (
                      <button
                        key={plan.months}
                        type="button"
                        onClick={() => setMonthsToAdd(plan.months)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                            : "border-dark-100 bg-dark-200 hover:border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                        <div className="text-white font-bold text-lg">{plan.label || `${plan.months} Month(s)`}</div>
                        <div className="text-green-400 font-semibold text-xl mt-1">₹{plan.price}</div>
                        <div className="text-gray-500 text-xs mt-1">~₹{monthlyRate}/month</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card-dark p-6 border-t-4 border-green-500">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            {parseInt(monthsToAdd) > 0 ? (
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

        {/* ✅ FIXED: Pass newStartDate to Modal for Cancelled/Reactivate flow */}
        <RenewalModal
          isOpen={showRenewalModal}
          onClose={() => setShowRenewalModal(false)}
          onConfirm={executeUpdate}
          memberData={{ name, mobile, email }}
          renewalData={{
            duration: monthsToAdd,
            pricePerMonth: renewal.pricePerMonth,
            subTotal: renewal.subTotal,
            finalTotal: renewal.finalTotal,
            discount: 0,
            
            newStartDate: renewal.newStartDate, // Added
            newEndDate: renewal.newEndDate,
            actionType: renewal.actionType, // Added
          }}
          photoPreview={photoPreview}
          loading={loading}
        />
      </div>
    );
  }

  // === NORMAL VIEW ===
  return (
    <div className="max-w-6xl mx-auto pt-6 pb-12 px-4">
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <h3 className="text-white font-bold">Take Photo</h3>
            <button onClick={stopCamera} className="p-2 text-white"><X size={24} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
          </div>
          <div className="p-6 bg-black/50 flex items-center justify-center gap-8">
            <button onClick={switchCamera} className="p-4 bg-white/20 rounded-full text-white"><RefreshCw size={24} /></button>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-primary-500" />
            </button>
            <button onClick={stopCamera} className="p-4 bg-red-500/50 rounded-full text-white"><X size={24} /></button>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Pass complete Renewal Data to Modal */}
      <RenewalModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        onConfirm={executeUpdate}
        memberData={{ name, mobile, email }}
        renewalData={{
          duration: monthsToAdd,
          pricePerMonth: renewal.pricePerMonth,
          subTotal: renewal.subTotal,
          finalTotal: renewal.finalTotal,
          discount: applyDiscount ? discountAmount : 0,
          
          newStartDate: renewal.newStartDate, // Ensure this is passed
          newEndDate: renewal.newEndDate,
          actionType: renewal.actionType,     // Ensure this is passed
          previousEndDate: endDate,           // Useful for extension logic display
        }}
        photoPreview={photoPreview}
        loading={loading}
      />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-200 p-6 rounded-2xl max-w-sm w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Cancel Membership?</h3>
            <p className="text-gray-400 mb-6">This will deactivate {name}'s account.</p>
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
                    <img src={photoPreview || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="" />
                  </div>
                  {photoBase64 && (
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
                    {hasCamera && (
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
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-dark w-full" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Mobile *</label>
                    <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-dark w-full" maxLength={10} placeholder="10 digits" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark w-full" placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Focus / Notes</label>
                  <input value={focusNote} onChange={(e) => setFocusNote(e.target.value)} className="input-dark w-full" placeholder="e.g., Weight loss" />
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-yellow-500" /> Security
            </h3>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setNewPassword("");
                      setShowPassword(false);
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${changePassword ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                  {changePassword && <CheckCircle size={14} className="text-black" />}
                </div>
              </div>
              <div>
                <span className="text-white font-medium">Reset Password</span>
                <p className="text-gray-500 text-xs">Set a new password for this member</p>
              </div>
            </label>

            {changePassword && (
              <div className="mt-4 p-4 bg-dark-400/50 rounded-xl border border-yellow-500/20 space-y-4">
                <div className="flex items-center gap-2 text-yellow-500/80 text-sm">
                  <Shield size={16} />
                  <span>Password will be encrypted before sending</span>
                </div>

                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-dark w-full pl-12 pr-12"
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-4 py-2 bg-yellow-600/20 text-yellow-500 rounded-lg text-sm font-medium hover:bg-yellow-600/30 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Generate Random
                  </button>

                  {newPassword && (
                    <span className={`text-sm ${newPassword.length >= 4 ? 'text-green-500' : 'text-red-500'}`}>
                      {newPassword.length >= 4 ? '✓ Valid' : `${4 - newPassword.length} more chars needed`}
                    </span>
                  )}
                </div>

                {newPassword && showPassword && (
                  <div className="p-3 bg-dark-300 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">New Password:</p>
                    <p className="text-white font-mono text-lg tracking-wider select-all">{newPassword}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ IMPROVED EXTEND MEMBERSHIP UI */}
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-primary-500" /> Extend Membership
              </h3>
              
              {/* Current Status Badge */}
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-gray-500" />
                <span className="text-gray-400">Expires:</span>
                <span className="text-white font-medium">{formatDate(endDate)}</span>
              </div>
            </div>

            {pricingList.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                Loading plans...
              </div>
            ) : (
              <>
                {/* Plan Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {pricingList.map((plan) => {
                    const isSelected = parseInt(monthsToAdd) === plan.months;
                    const monthlyRate = Math.round(Number(plan.price) / plan.months);
                    const isPopular = plan.months === 3 || plan.months === 6;

                    return (
                      <button
                        key={plan.months}
                        type="button"
                        onClick={() => setMonthsToAdd(isSelected ? 0 : plan.months)}
                        className={`relative p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          isSelected
                            ? "border-primary-500 bg-gradient-to-br from-primary-500/20 to-primary-600/10 shadow-lg shadow-primary-500/20 scale-[1.02]"
                            : "border-dark-100 bg-dark-200 hover:border-gray-600 hover:bg-dark-100"
                        }`}
                      >
                        {/* Popular Badge */}
                        {isPopular && !isSelected && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> Popular
                          </div>
                        )}

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}

                        {/* Plan Content */}
                        <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {plan.months}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-primary-300' : 'text-gray-500'}`}>
                          {plan.months === 1 ? 'Month' : 'Months'}
                        </div>
                        <div className={`text-xl font-bold mt-2 ${isSelected ? 'text-primary-400' : 'text-white'}`}>
                          ₹{plan.price}
                        </div>
                        <div className={`text-[10px] mt-1 ${isSelected ? 'text-primary-300/80' : 'text-gray-500'}`}>
                          ~₹{monthlyRate}/mo
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* No Extension Selected */}
                {parseInt(monthsToAdd) === 0 && (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed border-dark-100 rounded-xl">
                    <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                    <p className="text-sm">Select a plan above to extend membership</p>
                  </div>
                )}

                {/* Selected Plan Details */}
                {parseInt(monthsToAdd) > 0 && (
                  <div className="space-y-4">
                    {/* New End Date Preview */}
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
                        <p className="text-primary-400 font-bold">+{monthsToAdd} month(s)</p>
                      </div>
                    </div>

                    {/* Discount Section */}
                    <div className="p-4 bg-dark-300/50 rounded-xl border border-dark-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={applyDiscount} 
                            onChange={(e) => setApplyDiscount(e.target.checked)} 
                            className="sr-only" 
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            applyDiscount ? 'bg-green-500 border-green-500' : 'border-gray-600'
                          }`}>
                            {applyDiscount && <CheckCircle size={14} className="text-white" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-green-500" />
                          <span className="text-white font-medium">Apply Discount</span>
                        </div>
                      </label>

                      {applyDiscount && (
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-gray-400">Amount:</span>
                          <div className="relative flex-1 max-w-[150px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="input-dark w-full pl-8"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          {discountAmount > 0 && (
                            <span className="text-green-400 text-sm font-medium">
                              -₹{discountAmount} off
                            </span>
                          )}
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

            {parseInt(monthsToAdd) > 0 ? (
              <div className="space-y-3">
                {/* Plan Info */}
                <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Plan</span>
                    <span className="text-white font-bold">{monthsToAdd} Month(s)</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-500 text-sm">Rate</span>
                    <span className="text-primary-400 text-sm">~₹{renewal.pricePerMonth}/mo</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{renewal.subTotal}</span>
                  </div>
                  
                  {applyDiscount && discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Discount
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-400">₹{renewal.finalTotal}</span>
                </div>

                {/* New End Date */}
                <div className="flex items-center justify-between text-sm pt-2 text-gray-400">
                  <span>New End Date</span>
                  <span className="text-white">{formatDate(renewal.newEndDate)}</span>
                </div>

                {/* Password Indicator */}
                {changePassword && newPassword && (
                  <div className="flex items-center gap-2 text-yellow-500 text-sm pt-2">
                    <Lock size={14} />
                    <span>Password will be reset</span>
                  </div>
                )}

                <button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl mt-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Confirm Update
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-center mb-4">No extension selected</p>

                {/* Password Indicator */}
                {changePassword && newPassword && (
                  <div className="flex items-center gap-2 text-yellow-500 text-sm mb-4 justify-center">
                    <Lock size={14} />
                    <span>Password will be reset</span>
                  </div>
                )}
                <button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 font-medium transition-all"
                >
                  {loading ? "Saving..." : "Update Member"}
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowCancelModal(true)} 
              className="w-full py-3 mt-6 border border-red-900 text-red-500 rounded-xl hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={16} /> Cancel Membership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;