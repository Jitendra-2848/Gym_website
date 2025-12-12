import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Camera,
  X,
  RefreshCw,
  Trash2,
  AlertTriangle,
  User,
  ChevronDown,
  Upload,
  Ban,
  UserCheck,
} from "lucide-react";
import { Store } from "../../utils/store";
import RenewalModal from "../components/RenewalModal";

const PRICING_TIERS = [
  { months: 1, pricePerMonth: 500 },
  { months: 2, pricePerMonth: 480 },
  { months: 3, pricePerMonth: 450 },
  { months: 6, pricePerMonth: 400 },
  { months: 12, pricePerMonth: 350 },
];

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// ⚡ IMAGE COMPRESSION HELPER
const compressImage = (base64, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      let width = img.width;
      let height = img.height;

      // Resize if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };

    img.onerror = () => resolve(base64);
  });
};

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userList, getAllUser, updateUser, cancelUserMembership } = Store();

  // Refs
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

  // Camera States
  const [hasCamera, setHasCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  // Photo State
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [focusNote, setFocusNote] = useState("");

  // Renewal States
  const [monthsToAdd, setMonthsToAdd] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Find Member
  const member = userList.find((m) => m._id === id);
  const isCancelled = member?.iscancel === true;

  // 1. CHECK CAMERA & FETCH DATA
  useEffect(() => {
    const init = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasCamera(devices.some((d) => d.kind === "videoinput"));
      } catch (e) {
        setHasCamera(false);
      }

      setFetching(true);
      await getAllUser();
      setFetching(false);
    };
    init();
  }, [id]);

  // 2. POPULATE FORM WHEN MEMBER LOADS
  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setMobile(member.mobile || "");
      setEmail(member.email || "");
      setStartDate(member.start_date ? member.start_date.split("T")[0] : "");
      setEndDate(member.end_date ? member.end_date.split("T")[0] : "");
      setFocusNote(member.focus_note || "");
      setPhotoPreview(member.profile_pic || null);
      // Don't set photoBase64 here - only set when user changes photo
    }
  }, [member]);

  // 3. CLEANUP CAMERA ON UNMOUNT
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // --- RENEWAL CALCULATION ---
  const calculateRenewal = () => {
    const months = parseInt(monthsToAdd) || 0;
    if (months === 0)
      return { subTotal: 0, finalTotal: 0, newEndDate: "", pricePerMonth: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentEnd = endDate ? new Date(endDate) : today;
    const isExpired = currentEnd < today || isCancelled;
    const startFrom = isExpired ? today : currentEnd;

    const newEnd = new Date(startFrom);
    newEnd.setMonth(newEnd.getMonth() + months);

    const tier = PRICING_TIERS.find((t) => t.months === months) || PRICING_TIERS[0];
    const subTotal = tier.pricePerMonth * months;
    const discount = applyDiscount ? parseFloat(discountAmount) || 0 : 0;

    return {
      subTotal,
      finalTotal: Math.max(0, subTotal - discount),
      newEndDate: newEnd.toISOString().split("T")[0],
      pricePerMonth: tier.pricePerMonth,
    };
  };

  const renewal = calculateRenewal();

  // --- PHOTO HANDLERS (FIXED WITH COMPRESSION) ---

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowPhotoOptions(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;

      // Compress the image
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

  // --- CAMERA HANDLERS ---

  const openCamera = async (mode = "user") => {
    try {
      if (videoStream) {
        videoStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });

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
    } catch (err) {
      console.error("Camera error:", err);
      setError("Cannot access camera");
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    openCamera(newMode);
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
    }
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  // FIXED: Capture with compression
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    // Resize to max 400px
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

    // Compress to 70% quality
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    setPhotoPreview(base64);
    setPhotoBase64(base64);

    stopCamera();
  };

  // --- SUBMIT HANDLERS ---

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      setError("Valid 10-digit mobile is required");
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
      };

      // Only add photo if user changed it (photoBase64 is set)
      if (photoBase64) {
        updateData.profile_pic = photoBase64;
      }

      // Un-cancel if reactivating
      if (isCancelled && parseInt(monthsToAdd) > 0) {
        updateData.iscancel = false;
      }
      const result = await updateUser(id, updateData);
      if (result?.success) {
        setSuccess(true);
        setShowRenewalModal(false);
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
    } catch (err) {
      setError("Error cancelling");
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  // --- RENDER ---

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <User size={64} className="mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Member Not Found</h2>
        <button onClick={() => navigate("/admin/list")} className="btn-primary">
          Back
        </button>
      </div>
    );
  }

  // === CANCELLED VIEW ===
  if (isCancelled) {
    return (
      <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
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

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="text-green-500" /> Select Plan
              </h3>
              <select
                value={monthsToAdd}
                onChange={(e) => setMonthsToAdd(e.target.value)}
                className="w-full bg-dark-300 text-white p-4 rounded-xl border border-gray-600"
              >
                <option value="0">Select Duration...</option>
                {PRICING_TIERS.map((t) => (
                  <option key={t.months} value={t.months}>
                    {t.months} Month(s) - ₹{t.pricePerMonth}/mo
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-dark p-6 border-t-4 border-green-500">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            {parseInt(monthsToAdd) > 0 ? (
              <>
                <div className="flex justify-between text-gray-400 mb-2">
                  <span>Total</span>
                  <span className="text-green-400 font-bold">₹{renewal.finalTotal}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl mt-4 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Reactivate"}
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-center">Select a plan</p>
            )}
          </div>
        </div>

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
            newEndDate: renewal.newEndDate,
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
            <button onClick={stopCamera} className="p-2 text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
          </div>

          <div className="p-6 bg-black/50 flex items-center justify-center gap-8">
            <button onClick={switchCamera} className="p-4 bg-white/20 rounded-full text-white">
              <RefreshCw size={24} />
            </button>
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-white border-4 border-primary-500"></div>
            </button>
            <button onClick={stopCamera} className="p-4 bg-red-500/50 rounded-full text-white">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
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
          newEndDate: renewal.newEndDate,
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
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-dark-300 text-gray-300 rounded-xl">
                No
              </button>
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
          <button onClick={() => setError("")} className="ml-auto">
            <X size={16} />
          </button>
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
                    <button
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <span className="text-xs text-gray-500 mt-2">Tap to change</span>

                {showPhotoOptions && (
                  <div className="mt-2 bg-dark-200 rounded-xl border border-dark-100 overflow-hidden w-40 shadow-xl z-10">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2"
                    >
                      <Upload size={16} /> Upload Photo
                    </button>
                    {hasCamera && (
                      <button
                        onClick={() => openCamera("user")}
                        className="w-full py-3 px-4 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2"
                      >
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
                    <input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="input-dark w-full"
                      maxLength={10}
                      placeholder="10 digits"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark w-full" placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Focus / Notes</label>
                  <input
                    value={focusNote}
                    onChange={(e) => setFocusNote(e.target.value)}
                    className="input-dark w-full"
                    placeholder="e.g., Weight loss"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extend Membership */}
          <div className="card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="text-primary-500" /> Extend Membership
            </h3>

            <div className="relative mb-4">
              <select
                value={monthsToAdd}
                onChange={(e) => setMonthsToAdd(e.target.value)}
                className="w-full bg-dark-300 text-white p-4 rounded-xl border border-gray-600 appearance-none cursor-pointer"
              >
                <option value="0">No Extension</option>
                {PRICING_TIERS.map((t) => (
                  <option key={t.months} value={t.months}>
                    {t.months} Month(s) - ₹{t.pricePerMonth}/mo
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {parseInt(monthsToAdd) > 0 && (
              <div className="pt-4 border-t border-gray-700 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyDiscount}
                    onChange={(e) => setApplyDiscount(e.target.checked)}
                    className="w-5 h-5 accent-primary-500"
                  />
                  <span className="text-gray-300">Apply Discount?</span>
                </label>
                {applyDiscount && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">Amount:</span>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      className="input-dark w-32"
                      placeholder="₹"
                      min="0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-dark p-6 sticky top-6 border-t-4 border-primary-500">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>

            {parseInt(monthsToAdd) > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Plan</span>
                  <span>{monthsToAdd} Month(s)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Rate</span>
                  <span>₹{renewal.pricePerMonth}/mo</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{renewal.subTotal}</span>
                </div>
                {applyDiscount && discountAmount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-400">₹{renewal.finalTotal}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl mt-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : <><RefreshCw size={18} /> Confirm Renewal</>}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-center mb-4">No renewal</p>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 btn-primary bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Info Only"}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 mt-6 border border-red-900 text-red-500 rounded-xl hover:bg-red-900/20 flex items-center justify-center gap-2"
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