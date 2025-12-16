import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Upload, X, Camera, CheckCircle, AlertCircle,
  Percent, IndianRupee, Calendar, User
} from "lucide-react";
import { Store } from "../../utils/store";
import ConfirmationModal from "../components/ConfirmationModal";

// --- HELPER: Get Today's Date in YYYY-MM-DD (Local Time) ---
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- HELPER: Compress Image ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

const AddUser = () => {
  const navigate = useNavigate();

  // Store Selectors
  const addUser = Store((s) => s.addUser);
  const priceFun = Store((s) => s.priceFun);
  const pricingFromStore = Store((s) => s.pricing);

  // Local State
  const [pricingList, setPricingList] = useState([]);
  const fileInputRef = useRef(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Media
  const [photoBase64, setPhotoBase64] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    startDate: getTodayString(),
    endDate: "",
    duration: "",
    focus_note: "",
    extraDiscount: 0,
  });

  // ✅ ADDED: Selected Plan Object
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Totals
  const [totals, setTotals] = useState({
    basePrice: 0,
    discount: 0,
    finalTotal: 0,
    monthlyRate: 0,
    tierSaving: 0, // ✅ ADDED
  });

  // --- EFFECTS ---

  useEffect(() => {
    const fetchData = async () => {
      if (priceFun) await priceFun();
    };
    fetchData();

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => setHasCamera(devices.some((d) => d.kind === "videoinput")))
      .catch(() => setHasCamera(false));
  }, []);

  useEffect(() => {
    if (pricingFromStore && pricingFromStore.length > 0) {
      setPricingList(pricingFromStore);
    }
  }, [pricingFromStore]);

  useEffect(() => {
    return () => {
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
    };
  }, [videoStream]);

  // Auto-Calculate End Date
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      if (!isNaN(start.getTime())) {
        start.setMonth(start.getMonth() + parseInt(formData.duration));
        setFormData((prev) => ({
          ...prev,
          endDate: start.toISOString().split("T")[0],
        }));
      }
    }
  }, [formData.startDate, formData.duration]);

  // Auto-Calculate Prices
  useEffect(() => {
    if (formData.duration && pricingList.length > 0) {
      const months = parseInt(formData.duration);
      const plan = pricingList.find((p) => p.months === months);

      if (plan) {
        const basePrice = Number(plan.price);
        const discount = Number(formData.extraDiscount) || 0;
        const finalTotal = Math.max(0, basePrice - discount);
        const monthlyRate = Math.round(basePrice / months);

        // ✅ ADDED: Calculate tier saving
        const oneMonthPlan = pricingList.find((p) => p.months === 1);
        const tierSaving = oneMonthPlan 
          ? Math.max(0, (Number(oneMonthPlan.price) * months) - basePrice)
          : 0;

        // ✅ ADDED: Store selected plan
        setSelectedPlan(plan);
        setTotals({ basePrice, discount, finalTotal, monthlyRate, tierSaving });
      }
    } else {
      setSelectedPlan(null);
      setTotals({ basePrice: 0, discount: 0, finalTotal: 0, monthlyRate: 0, tierSaving: 0 });
    }
  }, [formData.duration, formData.extraDiscount, pricingList]);

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      const todayStr = getTodayString();
      if (value < todayStr) {
        return; 
      }
    }

    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handlePlanSelect = (months) => {
    setFormData({ ...formData, duration: months.toString() });
  };

  const handleFileUpload = async (e) => {
    if (e.target.files[0]) {
      const base64 = await compressImage(e.target.files[0]);
      setPhotoBase64(base64);
      setShowPhotoOptions(false);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setVideoStream(stream);
      setIsCameraOpen(true);
      setShowPhotoOptions(false);
    } catch {
      setError("Camera access denied");
    }
  };

  const capturePhoto = () => {
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    setPhotoBase64(canvas.toDataURL("image/jpeg", 0.7));
    videoStream.getTracks().forEach((t) => t.stop());
    setIsCameraOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Name is required");
    if (!formData.mobile.match(/^\d{10}$/)) return setError("Valid 10-digit mobile required");
    if (!formData.duration) return setError("Please select a plan");
    
    if (formData.startDate < getTodayString()) {
      return setError("Start date cannot be in the past");
    }

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

  const handleDateClick = (e) => {
    if (e.target.showPicker) e.target.showPicker();
  };

  // ✅ ADDED: Prepare Modal Data
  const getModalData = () => {
    return {
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
        selectedPlan: selectedPlan,
        planLabel: selectedPlan?.label || `${formData.duration} Month`,
        pricePerMonth: totals.monthlyRate,
        totalBeforeDiscount: totals.basePrice,
        tierSaving: totals.tierSaving,
        grandTotal: totals.finalTotal,
      }
    };
  };

  const modalData = getModalData();

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
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2"><User /> Personal Info</h2>
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
                      <button type="button" onClick={() => fileInputRef.current.click()} className="w-full p-3 text-sm text-left hover:bg-dark-200 text-gray-300 flex gap-2"><Upload size={14}/> Upload</button>
                      {hasCamera && <button type="button" onClick={openCamera} className="w-full p-3 text-sm text-left hover:bg-dark-200 text-gray-300 flex gap-2"><Camera size={14}/> Camera</button>}
                      {photoBase64 && <button type="button" onClick={() => { setPhotoBase64(null); setShowPhotoOptions(false); }} className="w-full p-3 text-sm text-left hover:bg-dark-200 text-red-400 flex gap-2"><X size={14}/> Remove</button>}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </div>

                {/* Text Inputs */}
                <div className="w-full space-y-4">
                  <input name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className="input-dark w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="mobile" placeholder="Mobile *" maxLength="10" value={formData.mobile} onChange={handleChange} className="input-dark w-full" />
                    <input name="email" placeholder="Email (Optional)" value={formData.email} onChange={handleChange} className="input-dark w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2"><Calendar /> Select Plan</h2>
              
              {pricingList.length === 0 ? (
                <div className="text-gray-500 text-center py-6 border border-dashed border-gray-700 rounded-xl">Loading plans...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {pricingList.map((tier) => (
                    <button
                      key={tier.months}
                      type="button"
                      onClick={() => handlePlanSelect(tier.months)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    onClick={handleDateClick}
                    min={getTodayString()}
                    className="input-dark w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">End Date (Auto)</label>
                  <input value={formData.endDate || "---"} disabled className="input-dark w-full opacity-60" />
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="card-dark p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex gap-2"><Percent /> Extras</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Discount (₹)</label>
                  <input type="number" name="extraDiscount" value={formData.extraDiscount} onChange={handleChange} className="input-dark w-full" placeholder="0" min="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Notes</label>
                  <input name="focus_note" value={formData.focus_note} onChange={handleChange} className="input-dark w-full" placeholder="e.g. Weight Loss" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex gap-2"><IndianRupee /> Summary</h2>
              
              {formData.duration ? (
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <p className="text-gray-300">Plan: <span className="text-white font-bold">{formData.duration} Months</span></p>
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

      {/* ✅ FIXED: Pass Complete Data to Modal */}
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
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          <video autoPlay playsInline ref={(el) => { if (el) el.srcObject = videoStream }} className="w-full max-w-md bg-black scale-x-[-1]" />
          <div className="flex gap-4 mt-4">
             <button type="button" onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300"></button>
             <button type="button" onClick={() => { setIsCameraOpen(false); if(videoStream) videoStream.getTracks().forEach(t=>t.stop()); }} className="p-4 bg-red-600 rounded-full text-white"><X /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;