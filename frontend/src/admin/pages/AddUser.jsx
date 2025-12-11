// src/admin/pages/AddUser.jsx (UPDATED FULL VERSION WITH CAMERA)
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Upload,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const MONTHLY_PRICE = 500; // price per month

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    startDate: "",
    endDate: "",
    duration: "",
    notes: "",
    photo: null,
    discountEnabled: false,
    discount: "",
    totalAmount: 0,
    grandTotal: 0,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  // ------------------- HANDLE CHANGES ------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedData = { ...formData, [name]: value };

    // Auto-set End Date when startDate or duration changes
    if (
      (name === "startDate" || name === "duration") &&
      updatedData.startDate &&
      updatedData.duration
    ) {
      const start = new Date(updatedData.startDate);
      start.setMonth(start.getMonth() + Number(updatedData.duration));
      updatedData.endDate = start.toISOString().split("T")[0];
    }

    // Auto-recalculate amounts
    if (
      name === "duration" ||
      name === "discount" ||
      name === "discountEnabled"
    ) {
      const durationMonths = Number(updatedData.duration || 0);
      const totalAmount = durationMonths * MONTHLY_PRICE;
      const discount = updatedData.discountEnabled
        ? Number(updatedData.discount || 0)
        : 0;
      updatedData.totalAmount = totalAmount;
      updatedData.grandTotal = Math.max(totalAmount - discount, 0);
    }

    setFormData(updatedData);
    setError("");
  };

  // ------------------- PHOTO UPLOAD ------------------------
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
      setShowPhotoOptions(false);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  // ------------------- CAMERA HANDLING ----------------------
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setVideoStream(stream);
      setIsCameraOpen(true);
      setShowPhotoOptions(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 320;
    const height = video.videoHeight || 320;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(blob);
        setFormData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(previewUrl);

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // --------------------- VALIDATION -------------------------
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.mobile.match(/^\d{10}$/))
      return "Enter valid 10-digit mobile number";

    if (!formData.startDate) return "Start date is required";
    if (!formData.duration) return "Select duration";

    if (formData.discountEnabled && Number(formData.discount) < 0)
      return "Discount cannot be negative";

    return null;
  };

  // --------------------- SUBMIT FORM ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);

    setTimeout(() => navigate("/admin/list"), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <UserPlus className="text-primary-500" />
          Add New Member
        </h1>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <span className="text-green-400">Member added successfully!</span>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* FORM */}
      <div className="card-dark p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ------------------ PHOTO PICKER (ONE CIRCLE + OPTIONS) ------------------ */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative w-32 h-32 rounded-full border-2 border-dashed border-dark-100 flex items-center justify-center cursor-pointer hover:border-primary-500 transition"
              onClick={() => setShowPhotoOptions((prev) => !prev)}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  className="w-full h-full rounded-full object-cover"
                  alt="Member"
                />
              ) : (
                <Camera className="text-gray-400" size={40} />
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto();
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex justify-center items-center"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Options Popup */}
            {showPhotoOptions && (
              <div className="mt-4 p-3 rounded-xl bg-dark-200 border border-dark-100 text-gray-300 space-y-2 w-44">
                <button
                  type="button"
                  className="w-full py-2 flex items-center justify-center gap-2 hover:text-primary-400"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={16} />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  className="w-full py-2 flex items-center justify-center gap-2 hover:text-primary-400"
                  onClick={openCamera}
                >
                  <Camera size={16} />
                  <span>Take Photo</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            )}
          </div>

          {/* CAMERA MODAL */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-dark-300 p-4 rounded-xl w-full max-w-md space-y-4">
                <h2 className="text-white font-semibold text-lg mb-2">
                  Capture Photo
                </h2>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-lg bg-dark-200 text-gray-300 hover:bg-dark-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Capture
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------ NAME + MOBILE ------------------ */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                className="input-dark"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-gray-300">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                name="mobile"
                placeholder="10-digit Mobile Number"
                className="input-dark"
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-gray-300">Email</label>
            <input
              name="email"
              className="input-dark"
              placeholder="Email Address (optional)"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* ------------------ START DATE + AUTO END DATE ------------------ */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-300">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                className="input-dark"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]} // ⬅ disables past dates
                onFocus={(e) => e.target.showPicker && e.target.showPicker()} // ⬅ open calendar automatically
              />
            </div>

            <div>
              <label className="text-gray-300">End Date (Auto)</label>
              <input
                type="date"
                disabled
                value={formData.endDate}
                className="input-dark opacity-60"
              />
            </div>
          </div>

          {/* ------------------ DURATION ------------------ */}
          <div>
            <label className="text-gray-300">
              Duration (Months) <span className="text-red-500">*</span>
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input-dark"
            >
              <option value="">Select Duration</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Month{i + 1 > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ------------------ DISCOUNT ------------------ */}
          <div className="mt-4">
            <label className="flex gap-3 text-gray-300">
              <input
                type="checkbox"
                checked={formData.discountEnabled}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "discountEnabled",
                      value: e.target.checked,
                    },
                  })
                }
              />
              Apply Discount?
            </label>

            {formData.discountEnabled && (
              <div className="mt-3">
                <label className="text-gray-300">Discount Amount (₹)</label>
                <input
                  name="discount"
                  type="number"
                  className="input-dark"
                  placeholder="Discount Amount"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* ------------------ AMOUNT BREAKDOWN ------------------ */}
          <div className="mt-6 p-4 rounded-xl bg-dark-200 border border-dark-100">
            <p className="text-gray-300">
              Monthly Rate:{" "}
              <span className="text-primary-400">₹{MONTHLY_PRICE}</span>
            </p>

            <p className="text-gray-300">
              Total Before Discount:
              <span className="text-primary-400 ml-2">
                ₹{formData.totalAmount}
              </span>
            </p>

            {formData.discountEnabled && (
              <p className="text-gray-300">
                Discount:
                <span className="text-red-400 ml-2">
                  -₹{formData.discount || 0}
                </span>
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-gray-300 font-medium mb-2 block">
              Grand Total (₹)
            </label>

            <div className="p-3 rounded-lg bg-dark-200 border border-dark-100">
              <p className="text-white font-bold text-xl">
                ₹{formData.grandTotal}
              </p>
            </div>
          </div>

          {/* ------------------ NOTES ------------------ */}
          <div>
            <label className="text-gray-300">Notes</label>
            <textarea
              className="input-dark"
              rows={4}
              name="notes"
              placeholder="Any additional information about the member..."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-dark-200 rounded-lg text-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
