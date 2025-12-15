import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Upload,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Percent,
  IndianRupee,
  Calendar,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { Store } from "../../utils/store";
import ConfirmationModal from "../components/ConfirmationModal";

// Compress Image Function
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
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(base64);
  });
};

// Pricing Tiers
const PRICING_TIERS = [
  { months: 1, amount: 500, label: "1 Month" },
  { months: 3, amount: 1500, label: "3 Months" },
  { months: 6, amount: 3000, label: "6 Months" },
  { months: 12, amount: 6000, label: "12 Months" },
];


const AddUser = () => {
  const navigate = useNavigate();
  const { addUser } = Store();

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Photo States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Camera States
  const [hasCamera, setHasCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    duration: "",
    focus_note: "",
    extraDiscount: 0,
  });

  const [pricing, setPricing] = useState({
    baseAmount: 0,
    extraDiscount: 0,
    grandTotal: 0,
    selectedPlan: null
  });


  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasCamera(videoDevices.length > 0);
      } catch (err) {
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // Calculate Pricing
  useEffect(() => {
    if (!formData.duration) {
      setPricing({
        baseAmount: 0,
        extraDiscount: 0,
        grandTotal: 0,
        selectedPlan: null
      });
      return;
    }

    const months = parseInt(formData.duration);
    const tier = PRICING_TIERS.find(t => t.months === months);

    const baseAmount = tier.amount;
    const extraDiscount = Number(formData.extraDiscount) || 0;
    const grandTotal = Math.max(baseAmount - extraDiscount, 0);

    setPricing({
      baseAmount,
      extraDiscount,
      grandTotal,
      selectedPlan: tier
    });
  }, [formData.duration, formData.extraDiscount]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if ((name === "startDate" || name === "duration") && updated.startDate && updated.duration) {
      const start = new Date(updated.startDate);
      start.setMonth(start.getMonth() + Number(updated.duration));
      updated.endDate = start.toISOString().split("T")[0];
    }

    setFormData(updated);
    setError("");
  };

  const selectDuration = (months) => {
    let updated = { ...formData, duration: months.toString() };
    if (updated.startDate) {
      const start = new Date(updated.startDate);
      start.setMonth(start.getMonth() + months);
      updated.endDate = start.toISOString().split("T")[0];
    }
    setFormData(updated);
    setError("");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setPhotoFile(base64);
        setPhotoPreview(URL.createObjectURL(file));
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPhotoOptions(false);
  };

  // --- Helpers to fix Input issues ---

  // 1. Prevent scroll from changing number
  const handleWheel = (e) => e.target.blur();

  // 2. Open Calendar on click anywhere in input
  const handleDateClick = (e) => {
    if (e.target.showPicker) e.target.showPicker();
  };

  // --- Camera Logic ---
  const openCamera = async (mode = "user") => {
    try {
      if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
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
      setError("Unable to access camera.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setPhotoFile(base64);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      };
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.9);
  };

  const stopCamera = () => {
    if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  const switchCamera = () => {
    openCamera(facingMode === "user" ? "environment" : "user");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.mobile.match(/^\d{10}$/)) return "Enter valid 10-digit mobile";
    if (!formData.startDate) return "Start date is required";
    if (!formData.duration) return "Select a plan";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setShowModal(true);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || "",
        startDate: formData.startDate,
        duration: formData.duration,
        discount: formData.extraDiscount || 0,
        totalAmount: pricing.grandTotal,
        focus_note: formData.focus_note || "",
        profile_pic: photoFile || null
      };

      const result = await addUser(data);

      if (result.success) {
        setShowModal(false);
        setSuccess(true);
        setTimeout(() => navigate("/admin/list"), 2000);
      } else {
        setShowModal(false);
        setError(result.message || "Failed to add member");
      }
    } catch (err) {
      setShowModal(false);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-12 px-4 relative">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <UserPlus className="text-primary-500" size={32} />
          Add New Member
        </h1>
        <p className="text-gray-400 mt-2">Register a new gym member</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={24} />
          <span className="text-green-400 font-medium">Member added successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="text-primary-500" size={20} />
                Personal Information
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className="relative w-28 h-28 rounded-full border-2 border-dashed border-dark-100 flex items-center justify-center cursor-pointer hover:border-primary-500 transition overflow-hidden bg-dark-200"
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Photo" />
                    ) : (
                      <Camera className="text-gray-500" size={32} />
                    )}
                    {photoPreview && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(); }} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={12} /></button>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs mt-2">Tap to add</span>
                  {showPhotoOptions && (
                    <div className="mt-2 p-2 rounded-lg bg-dark-200 border border-dark-100 space-y-1 w-36 relative z-10">
                      <button type="button" className="w-full py-2 text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-primary-400" onClick={() => fileInputRef.current.click()}><Upload size={14} /> Upload</button>
                      {hasCamera && (
                        <button type="button" className="w-full py-2 text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-primary-400" onClick={() => openCamera("user")}><Camera size={14} /> Camera</button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" className="input-dark w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Mobile *</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} maxLength={10} placeholder="10 digits" className="input-dark w-full" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} placeholder="Optional" className="input-dark w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary-500" size={20} />
                Membership Plan
              </h2>
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Select Plan *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PRICING_TIERS.map((tier) => (
                    <button
                      key={tier.months}
                      type="button"
                      onClick={() => selectDuration(tier.months)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${formData.duration === tier.months.toString()
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-dark-100 hover:border-dark-50 bg-dark-200"
                        }`}
                    >
                      <p className="text-white font-bold text-m">{tier.label}</p>
                      <p className="text-primary-400 font-semibold text-sm">
                        ₹{tier.amount}
                      </p>

                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    onClick={handleDateClick} // Opens picker on click
                    min={new Date().toISOString().split("T")[0]}
                    className="input-dark w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                  <div className="input-dark opacity-60 flex items-center">{formData.endDate ? formatDisplayDate(formData.endDate) : "Select plan first"}</div>
                </div>
              </div>
            </div>

            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Percent className="text-primary-500" size={20} />
                Additional Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Extra Discount (₹)</label>
                  <input
                    type="number"
                    name="extraDiscount"
                    value={formData.extraDiscount}
                    onChange={handleChange}
                    onWheel={handleWheel} // Prevents scroll change
                    placeholder="0"
                    min="0"
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Focus Area / Notes</label>
                  <input name="focus_note" value={formData.focus_note} onChange={handleChange} placeholder="e.g., Weight loss" className="input-dark w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <IndianRupee className="text-primary-500" size={20} />
                Payment Summary
              </h2>
              {formData.duration ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                    <p className="text-gray-400 text-sm">Selected Plan</p>
                    <p className="text-white font-bold text-xl">{formData.duration} Month{formData.duration > 1 ? "s" : ""}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400"><span>Base Price</span><span>₹{500 * parseInt(formData.duration)}</span></div>
                    {pricing.extraDiscount > 0 && <div className="flex justify-between text-red-400"><span>Extra Discount</span><span>-₹{pricing.extraDiscount}</span></div>}
                    <div className="border-t border-dark-100 pt-3 flex justify-between text-white font-bold text-lg"><span>Total Pay</span><span className="text-primary-400">₹{pricing.grandTotal}</span></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Select a plan to see pricing</p>
                </div>
              )}
              <button type="submit" disabled={loading || !formData.duration} className="w-full mt-6 btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50">
                <UserPlus size={20} /> Proceed
              </button>
              <button type="button" onClick={() => navigate(-1)} className="w-full mt-3 py-3 rounded-lg bg-dark-200 text-gray-400 hover:bg-dark-100 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleFinalConfirm}
        memberData={formData}
        pricingData={pricing}
        photoPreview={photoPreview}
        loading={loading}
      />

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-300 p-4 rounded-xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Take Photo</h2>
              <button type="button" onClick={stopCamera} className="p-2 rounded-lg bg-dark-200 text-gray-300"><X size={20} /></button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
            <div className="flex justify-center gap-4">
              <button type="button" onClick={switchCamera} className="p-3 rounded-full bg-dark-200 text-gray-300"><RefreshCw size={20} /></button>
              <button type="button" onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-primary-600" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;