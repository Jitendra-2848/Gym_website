import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Upload, X, Camera, CheckCircle, AlertCircle,
  Percent, IndianRupee, Calendar, User,
} from "lucide-react";
import { Store } from "../../utils/store";
import ConfirmationModal from "../components/ConfirmationModal";

// Helper Functions
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(400 / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

// ✅ FIXED: Reusable Date Input Component
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
          className={`input-dark w-full min-w-44 pr-10 ${disabled ? "opacity-60" : ""}`}
          style={{ colorScheme: "dark" }}
        />
        {/* <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <Calendar size={18} />
        </button> */}
      </div>
    </div>
  );
};

const AddUser = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Store
  const { addUser, priceFun, pricing: pricingFromStore } = Store();

  // States
  const [pricingList, setPricingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Photo & Camera
  const [photoBase64, setPhotoBase64] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [camera, setCamera] = useState({ hasCamera: false, isOpen: false, stream: null });

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    Date_Of_Birth: "",
    startDate: getTodayString(),
    endDate: "",
    duration: "",
    focus_note: "",
    extraDiscount: 0,
  });

  // Calculated Values
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [totals, setTotals] = useState({ basePrice: 0, discount: 0, finalTotal: 0, monthlyRate: 0, tierSaving: 0 });

  // Form update helper
  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  // Fetch pricing on mount
  useEffect(() => {
    const init = async () => {
      if (priceFun) await priceFun();
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCamera((c) => ({ ...c, hasCamera: devices.some((d) => d.kind === "videoinput") }));
      } catch { /* ignore */ }
    };
    init();
  }, [priceFun]);

  // Update pricing list
  useEffect(() => {
    if (pricingFromStore?.length > 0) setPricingList(pricingFromStore);
  }, [pricingFromStore]);

  // Cleanup camera
  useEffect(() => {
    return () => camera.stream?.getTracks().forEach((t) => t.stop());
  }, [camera.stream]);

  // Auto-calculate end date
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      if (!isNaN(start.getTime())) {
        start.setMonth(start.getMonth() + parseInt(formData.duration));
        updateForm("endDate", start.toISOString().split("T")[0]);
      }
    }
  }, [formData.startDate, formData.duration]);

  // Auto-calculate prices
  useEffect(() => {
    if (!formData.duration || !pricingList.length) {
      setSelectedPlan(null);
      setTotals({ basePrice: 0, discount: 0, finalTotal: 0, monthlyRate: 0, tierSaving: 0 });
      return;
    }

    const months = parseInt(formData.duration);
    const plan = pricingList.find((p) => p.months === months);

    if (plan) {
      const basePrice = Number(plan.price);
      const discount = Number(formData.extraDiscount) || 0;
      const oneMonthPlan = pricingList.find((p) => p.months === 1);
      const tierSaving = oneMonthPlan ? Math.max(0, Number(oneMonthPlan.price) * months - basePrice) : 0;

      setSelectedPlan(plan);
      setTotals({
        basePrice,
        discount,
        finalTotal: Math.max(0, basePrice - discount),
        monthlyRate: Math.round(basePrice / months),
        tierSaving,
      });
    }
  }, [formData.duration, formData.extraDiscount, pricingList]);

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await compressImage(file);
      setPhotoBase64(base64);
      setShowPhotoOptions(false);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCamera({ ...camera, stream, isOpen: true });
      setShowPhotoOptions(false);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError("Camera access denied");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    setPhotoBase64(canvas.toDataURL("image/jpeg", 0.7));
    closeCamera();
  };

  const closeCamera = () => {
    camera.stream?.getTracks().forEach((t) => t.stop());
    setCamera({ ...camera, stream: null, isOpen: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Name is required");
    if (!formData.mobile.match(/^\d{10}$/)) return setError("Valid 10-digit mobile required");
    if (!formData.duration) return setError("Please select a plan");
    if (formData.startDate < getTodayString()) return setError("Start date cannot be in the past");
    setShowModal(true);
  };

  const executeAddUser = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        discount: totals.discount,
        totalAmount: totals.finalTotal,
        profile_pic: photoBase64 || "",
      };

      const res = await addUser(payload);
      if (res.success) {
        setSuccess(true);
        setShowModal(false);
        setTimeout(() => navigate("/admin/list"), 1500);
      } else {
        setError(res.message || "Failed to add");
        setShowModal(false);
      }
    } catch {
      setError("Server Error");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Modal data
  const modalData = {
    memberData: {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      duration: parseInt(formData.duration) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      focus_note: formData.focus_note,
      extraDiscount: Number(formData.extraDiscount) || 0,
    },
    pricingData: {
      selectedPlan,
      planLabel: selectedPlan?.label || `${formData.duration} Month`,
      pricePerMonth: totals.monthlyRate,
      totalBeforeDiscount: totals.basePrice,
      tierSaving: totals.tierSaving,
      grandTotal: totals.finalTotal,
    },
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserPlus className="text-primary-500" size={32} />
          Add New Member
        </h1>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 text-green-400 flex items-center gap-2">
          <CheckCircle size={24} /> Member added successfully!
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 text-red-400 flex items-center gap-2">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2">
                <User /> Personal Info
              </h2>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Photo */}
                <div className="relative">
                  <div
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                    className="w-28 h-28 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer bg-dark-200"
                  >
                    {photoBase64 ? (
                      <img src={photoBase64} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Camera className="text-gray-500" size={32} />
                    )}
                  </div>
                  {showPhotoOptions && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-dark-300 border border-gray-700 rounded-lg z-10">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-3 text-sm text-left hover:bg-dark-200 text-gray-300 flex gap-2">
                        <Upload size={14} /> Upload
                      </button>
                      {camera.hasCamera && (
                        <button type="button" onClick={openCamera} className="w-full p-3 text-sm text-left hover:bg-dark-200 text-gray-300 flex gap-2">
                          <Camera size={14} /> Camera
                        </button>
                      )}
                      {photoBase64 && (
                        <button
                          type="button"
                          onClick={() => { setPhotoBase64(null); setShowPhotoOptions(false); }}
                          className="w-full p-3 text-sm text-left hover:bg-dark-200 text-red-400 flex gap-2"
                        >
                          <X size={14} /> Remove
                        </button>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </div>

                {/* Text Inputs */}
                <div className="w-full space-y-4">
                  <input
                    name="name"
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="input-dark w-full"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="mobile"
                      placeholder="Mobile *"
                      maxLength="10"
                      value={formData.mobile}
                      onChange={(e) => updateForm("mobile", e.target.value)}
                      className="input-dark w-full"
                    />
                    <input
                      name="email"
                      placeholder="Email (Optional)"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="input-dark w-full"
                    />
                    
                    {/* ✅ FIXED: Date of Birth - Supports both typing and picker */}
                    <DateInput
                      label="Date of Birth"
                      value={formData.Date_Of_Birth}
                      onChange={(value) => updateForm("Date_Of_Birth", value)}
                      max={getTodayString()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2">
                <Calendar /> Select Plan
              </h2>

              {pricingList.length === 0 ? (
                <div className="text-gray-500 text-center py-6 border border-dashed border-gray-700 rounded-xl">
                  Loading plans...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {pricingList.map((tier) => (
                    <button
                      key={tier.months}
                      type="button"
                      onClick={() => updateForm("duration", tier.months.toString())}
                      className={`p-4 rounded-xl border-2 text-center transition ${
                        formData.duration === tier.months.toString()
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-dark-100 bg-dark-200 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-white font-bold">{tier.label || `${tier.months} Month(s)`}</div>
                      <div className="text-primary-400 text-sm">₹{tier.price}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* ✅ FIXED: Start Date & End Date - Both support typing and picker */}
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(value) => {
                    // Validate: Don't allow past dates
                    if (value >= getTodayString()) {
                      updateForm("startDate", value);
                    }
                  }}
                  min={getTodayString()}
                />
                <DateInput
                  label="End Date (Auto)"
                  value={formData.endDate}
                  onChange={() => {}} // Read-only
                  disabled={true} 
                />
              </div>
            </div>

            {/* Extras */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2">
                <Percent /> Extras
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.extraDiscount}
                    onChange={(e) => updateForm("extraDiscount", e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    className="input-dark w-full"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Notes</label>
                  <input
                    value={formData.focus_note}
                    onChange={(e) => updateForm("focus_note", e.target.value)}
                    className="input-dark w-full"
                    placeholder="e.g. Weight Loss"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex gap-2">
                <IndianRupee /> Summary
              </h2>

              {formData.duration ? (
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <p className="text-gray-300">
                      Plan: <span className="text-white font-bold">{formData.duration} Months</span>
                    </p>
                    <p className="text-primary-400">~₹{totals.monthlyRate}/mo</p>
                  </div>

                  <div className="flex justify-between text-gray-400 pt-2">
                    <span>Subtotal</span>
                    <span>₹{totals.basePrice}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-₹{totals.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="text-primary-400">₹{totals.finalTotal}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">Select a plan</p>
              )}

              <button type="submit" disabled={loading} className="w-full mt-6 btn-primary py-3 flex justify-center gap-2 disabled:opacity-50">
                <UserPlus size={20} /> Add Member
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={executeAddUser}
        memberData={modalData.memberData}
        pricingData={modalData.pricingData}
        photoPreview={photoBase64}
        loading={loading}
      />

      {/* Camera Modal */}
      {camera.isOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md bg-black scale-x-[-1]"
          />
          <div className="flex gap-4 mt-4">
            <button type="button" onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
            <button type="button" onClick={closeCamera} className="p-4 bg-red-600 rounded-full text-white">
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;