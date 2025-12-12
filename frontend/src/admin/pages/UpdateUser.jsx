import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Edit, CheckCircle, AlertCircle, ArrowLeft, 
  Calendar, Plus, Camera, X, RefreshCw, Trash2, 
  AlertTriangle, User, ChevronDown, CheckSquare, Upload, Lock, Ban, UserCheck
} from 'lucide-react'
import { Store } from '../../utils/store'
import RenewalModal from '../components/RenewalModal'

const PRICING_TIERS = [
  { months: 1, pricePerMonth: 500 },
  { months: 2, pricePerMonth: 480 },
  { months: 3, pricePerMonth: 450 },
  { months: 6, pricePerMonth: 400 },
  { months: 12, pricePerMonth: 350 },
];

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const UpdateUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userList, getAllUser, updateUser, cancelUserMembership } = Store()
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', start_date: '', end_date: '', focus_note: ''
  })

  const [renewalSettings, setRenewalSettings] = useState({
    monthsToAdd: 0,
    applyDiscount: false,
    discountAmount: 0
  })

  const [renewalCalculations, setRenewalCalculations] = useState({
    subTotal: 0,
    finalTotal: 0,
    renewalStartDate: '',
    newEndDate: '',
    pricePerMonth: 0,
    isExpired: false
  })

  // Check Camera
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasCamera(devices.filter((d) => d.kind === "videoinput").length > 0);
      } catch (err) { setHasCamera(false); }
    };
    checkCamera();
  }, []);

  // Fetch Data
  useEffect(() => {
    const load = async () => {
      if (userList.length === 0) await getAllUser()
      setFetching(false)
    }
    load()
  }, [userList.length, getAllUser])

  // Populate Form
  const member = userList.find(m => m._id === id)
  const isCancelled = member?.iscancel === true;

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        mobile: member.mobile || '',
        email: member.email || '',
        start_date: member.start_date ? member.start_date.split('T')[0] : '',
        end_date: member.end_date ? member.end_date.split('T')[0] : '',
        focus_note: member.focus_note || ''
      })
      setPhotoPreview(member.profile_pic || null)
    }
  }, [member])

  // Cleanup Stream
  useEffect(() => {
    return () => {
      if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    };
  }, [videoStream]);

  // Calculate Renewal Logic
  useEffect(() => {
    const months = parseInt(renewalSettings.monthsToAdd);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const currentEndDate = new Date(formData.end_date || today);
    const isExpired = currentEndDate < today || isCancelled;

    // If Cancelled or Expired, Start from Today
    const effectiveStartDate = isExpired ? today : currentEndDate;
    
    if (months === 0) {
      setRenewalCalculations(prev => ({ 
        ...prev, subTotal: 0, finalTotal: 0, newEndDate: '', 
        renewalStartDate: effectiveStartDate.toISOString().split('T')[0],
        pricePerMonth: 0, isExpired 
      }));
      return;
    }

    const newEndDate = new Date(effectiveStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    const tier = PRICING_TIERS.find(t => t.months === months) || PRICING_TIERS[0];
    const subTotal = tier.pricePerMonth * months;
    const discount = renewalSettings.applyDiscount ? parseFloat(renewalSettings.discountAmount) || 0 : 0;

    setRenewalCalculations({
      subTotal,
      finalTotal: Math.max(0, subTotal - discount),
      renewalStartDate: effectiveStartDate.toISOString().split('T')[0], 
      newEndDate: newEndDate.toISOString().split('T')[0],       
      pricePerMonth: tier.pricePerMonth,
      isExpired
    });
  }, [renewalSettings, formData.end_date, isCancelled]);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRenewalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRenewalSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Photo & Camera
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); setShowPhotoOptions(false); }
  };
  const removePhoto = () => { setPhotoFile(null); setPhotoPreview(null); setShowPhotoOptions(false); };
  
  const openCamera = async (mode = "user") => {
    try {
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setVideoStream(stream); setFacingMode(mode); setIsCameraOpen(true); setShowPhotoOptions(false);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
    } catch (err) { setError("Camera access denied"); }
  };
  const switchCamera = () => openCamera(facingMode === "user" ? "environment" : "user");
  const stopCamera = () => { if (videoStream) videoStream.getTracks().forEach((t) => t.stop()); setIsCameraOpen(false); };
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setPhotoFile(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      setPhotoPreview(URL.createObjectURL(blob)); stopCamera();
    }, "image/jpeg", 0.9);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (renewalSettings.monthsToAdd > 0) {
      setShowRenewalModal(true);
    } else if (!isCancelled) {
      executeUpdate();
    }
  }

  const executeUpdate = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('mobile', formData.mobile);
      submitData.append('email', formData.email);
      submitData.append('focus_note', formData.focus_note);
      submitData.append('start_date', formData.start_date);
      submitData.append('end_date', renewalSettings.monthsToAdd > 0 ? renewalCalculations.newEndDate : formData.end_date);
      
      // If renewing a cancelled user, uncancel them
      if (isCancelled && renewalSettings.monthsToAdd > 0) {
        submitData.append('iscancel', 'false');
      }
      
      if (photoFile) submitData.append('profile_pic', photoFile);

      const result = await updateUser(id, submitData);
      if (result && result.success) {
        setSuccess(true); setShowRenewalModal(false);
        setTimeout(() => navigate('/admin/list'), 1500);
      } else { setError("Update failed"); }
    } catch (err) { setError("Server error"); } finally { setLoading(false); }
  }

  const handleCancelMembership = async () => {
    setLoading(true);
    const result = await cancelUserMembership(id);
    setLoading(false);
    if(result && result.success) navigate('/admin/list');
    else setError("Failed to cancel membership");
    setShowCancelModal(false);
  }

  if (fetching) return <div className="p-10 text-center text-white">Loading...</div>;
  if (!member) return <div className="p-10 text-center text-white">Member not found</div>;

  // --- CANCELLED USER VIEW ---
  if (isCancelled) {
    return (
      <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back
        </button>

        {/* Cancelled Banner */}
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
          <Ban className="text-red-500" size={24} />
          <div>
            <span className="text-red-400 font-bold">Membership Cancelled</span>
            <p className="text-red-300/70 text-sm">This member's membership has been cancelled. Renew to reactivate.</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-2">
            <CheckCircle /> Membership Reactivated!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: Basic Info (Read Only) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                <User className="text-red-500" size={24} /> Cancelled Member
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <img 
                  src={photoPreview || DEFAULT_AVATAR} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-red-500/50 opacity-80"
                />
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                  <p className="text-gray-400">{member.mobile}</p>
                  {member.email && <p className="text-gray-500">{member.email}</p>}
                </div>
              </div>
            </div>

            {/* Renewal Section */}
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                <UserCheck className="text-green-500" size={24} /> Reactivate Membership
              </h2>

              <div className="bg-gradient-to-r from-green-900/20 to-dark-100 p-6 rounded-2xl border border-green-500/30 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="text-green-400" /> Select New Plan
                </h3>

                <div className="relative mb-6">
                  <select 
                    name="monthsToAdd" 
                    value={renewalSettings.monthsToAdd} 
                    onChange={handleRenewalChange} 
                    className="w-full appearance-none bg-dark-300 text-white p-4 pl-5 rounded-xl border border-gray-600 focus:border-green-500 outline-none text-lg cursor-pointer"
                  >
                    <option value="0">Select Duration...</option>
                    {PRICING_TIERS.map(t => (
                      <option key={t.months} value={t.months}>{t.months} Month{t.months > 1 ? 's' : ''} (₹{t.pricePerMonth}/mo)</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>

                {parseInt(renewalSettings.monthsToAdd) > 0 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                       <div>
                          <label className="text-gray-400 text-xs uppercase font-bold mb-1 block flex items-center gap-1"><Lock size={12} /> Start Date</label>
                          <input type="date" readOnly value={renewalCalculations.renewalStartDate} className="input-dark w-full bg-dark-300 text-gray-400 cursor-not-allowed" />
                       </div>
                       <div>
                          <label className="text-green-400 text-xs uppercase font-bold mb-1 block flex items-center gap-1"><Lock size={12} /> New End Date</label>
                          <input type="date" readOnly value={renewalCalculations.newEndDate} className="input-dark w-full bg-dark-300 border-green-500/50 text-green-400 cursor-not-allowed font-bold" />
                       </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group mb-3 select-none">
                            <input type="checkbox" name="applyDiscount" checked={renewalSettings.applyDiscount} onChange={handleRenewalChange} className="hidden peer" />
                            <div className="w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                                {renewalSettings.applyDiscount && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-gray-300 group-hover:text-white">Apply Discount?</span>
                        </label>
                        {renewalSettings.applyDiscount && (
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Amount (₹):</span>
                                <input type="number" name="discountAmount" onWheel={(e) => e.target.blur()} value={renewalSettings.discountAmount} onChange={handleRenewalChange} placeholder="0" className="input-dark w-40 bg-dark-300 border-green-500/50" />
                            </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-6 border-t-4 border-t-green-500 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Reactivation Summary</h3>

              {parseInt(renewalSettings.monthsToAdd) > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 uppercase font-bold">
                      <span>New Plan</span>
                      <span>{renewalSettings.monthsToAdd} Months</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-gray-400"><span>Base Price</span><span>₹{renewalCalculations.subTotal}</span></div>
                    {renewalSettings.applyDiscount && (<div className="flex justify-between text-red-400 font-medium"><span>Discount</span><span>- ₹{renewalSettings.discountAmount}</span></div>)}
                    <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-gray-700"><span>To Pay</span><span className="text-green-400">₹{renewalCalculations.finalTotal}</span></div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="w-full mt-4 py-4 text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 shadow-lg">
                    <UserCheck size={20} /> Reactivate Membership
                  </button>
                </div>
              ) : (
                <div className="py-8 text-gray-500 text-center">
                  <AlertCircle size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Select a plan to reactivate.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Renewal Modal */}
        <RenewalModal 
          isOpen={showRenewalModal}
          onClose={() => setShowRenewalModal(false)}
          onConfirm={executeUpdate}
          memberData={formData}
          renewalData={{
            duration: renewalSettings.monthsToAdd,
            pricePerMonth: renewalCalculations.pricePerMonth,
            subTotal: renewalCalculations.subTotal,
            finalTotal: renewalCalculations.finalTotal,
            discount: renewalSettings.applyDiscount ? renewalSettings.discountAmount : 0,
            previousEndDate: renewalCalculations.renewalStartDate, 
            newEndDate: renewalCalculations.newEndDate
          }}
          photoPreview={photoPreview}
          loading={loading}
        />
      </div>
    );
  }

  // --- NORMAL USER VIEW ---
  return (
    <div className="max-w-7xl mx-auto pt-6 pb-12 px-4 relative min-h-screen">
      
      <RenewalModal 
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        onConfirm={executeUpdate}
        memberData={formData}
        renewalData={{
          duration: renewalSettings.monthsToAdd,
          pricePerMonth: renewalCalculations.pricePerMonth,
          subTotal: renewalCalculations.subTotal,
          finalTotal: renewalCalculations.finalTotal,
          discount: renewalSettings.applyDiscount ? renewalSettings.discountAmount : 0,
          previousEndDate: renewalCalculations.renewalStartDate, 
          newEndDate: renewalCalculations.newEndDate
        }}
        photoPreview={photoPreview}
        loading={loading}
      />

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-dark-200 p-6 rounded-2xl max-w-sm w-full text-center">
                <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">Cancel Membership?</h3>
                <p className="text-gray-400 mb-6">This will deactivate the member. They can be reactivated by renewing.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-xl bg-dark-300 text-gray-300">Keep</button>
                    <button onClick={handleCancelMembership} disabled={loading} className="flex-1 py-3 rounded-xl bg-red-600 text-white disabled:opacity-50">
                      {loading ? 'Processing...' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-300 p-4 rounded-xl w-full max-w-md">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={switchCamera} className="p-3 rounded-full bg-dark-200 text-gray-300"><RefreshCw /></button>
              <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-primary-600" /></button>
              <button onClick={stopCamera} className="p-3 rounded-full bg-red-500/20 text-red-500"><X /></button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Edit className="text-primary-500" size={32} /> Update Member
        </h1>
      </div>

      {success && <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-2"><CheckCircle /> Success!</div>}
      {error && <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 flex items-center gap-2"><AlertCircle /> {error}</div>}
      
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-dark p-6">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                <User className="text-primary-500" size={24} /> Personal Details
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-dark-100 flex items-center justify-center cursor-pointer bg-dark-200" onClick={() => setShowPhotoOptions(!showPhotoOptions)}>
                    {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover rounded-full" /> : <Camera className="text-gray-500" size={32} />}
                    {photoPreview && <button onClick={(e) => { e.stopPropagation(); removePhoto(); }} className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center z-10"><X size={14} /></button>}
                  </div>
                  {showPhotoOptions && (
                    <div className="mt-2 p-2 rounded-lg bg-dark-300 border border-dark-100 space-y-1 w-40 relative z-20 shadow-xl">
                      <button className="w-full py-2 text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-dark-100" onClick={() => fileInputRef.current.click()}> <Upload size={14} /> Upload </button>
                      {hasCamera && <button className="w-full py-2 text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-dark-100" onClick={() => openCamera("user")}> <Camera size={14} /> Camera </button>}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                         <label className="text-gray-400 text-sm mb-1 block">Full Name</label>
                         <input name="name" value={formData.name} onChange={handleChange} className="input-dark w-full" />
                    </div>
                    <div>
                         <label className="text-gray-400 text-sm mb-1 block">Mobile</label>
                         <input name="mobile" value={formData.mobile} onChange={handleChange} className="input-dark w-full" />
                    </div>
                    <div>
                         <label className="text-gray-400 text-sm mb-1 block">Email</label>
                         <input name="email" value={formData.email} onChange={handleChange} className="input-dark w-full" />
                    </div>
                </div>
            </div>
          </div>

          <div className="card-dark p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                <Calendar className="text-primary-500" size={24} /> Membership Dates
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="text-gray-400 text-sm mb-1 block">Join Date</label>
                    <input type="date" disabled value={formData.start_date} className="input-dark w-full opacity-60" />
                </div>
                <div>
                    <label className="text-gray-400 text-sm mb-1 block">Current Expiry</label>
                    <input type="date" disabled value={formData.end_date} className="input-dark w-full opacity-60" />
                </div>
            </div>

            <div className="bg-gradient-to-r from-dark-200 to-dark-100 p-6 rounded-2xl border border-primary-500/30 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="text-primary-400" /> Extend Membership
                </h3>

                <div className="relative mb-6">
                    <select name="monthsToAdd" value={renewalSettings.monthsToAdd} onChange={handleRenewalChange} className="w-full appearance-none bg-dark-300 text-white p-4 pl-5 rounded-xl border border-gray-600 focus:border-primary-500 outline-none text-lg cursor-pointer">
                        <option value="0">Select Duration...</option>
                        {PRICING_TIERS.map(t => (<option key={t.months} value={t.months}>{t.months} Month{t.months > 1 ? 's' : ''} (₹{t.pricePerMonth}/mo)</option>))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>

                {parseInt(renewalSettings.monthsToAdd) > 0 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                       <div><label className="text-gray-400 text-xs uppercase font-bold mb-1 block flex items-center gap-1"><Lock size={12} /> Renewal Start</label><input type="date" readOnly value={renewalCalculations.renewalStartDate} className="input-dark w-full bg-dark-300 text-gray-400 cursor-not-allowed" /></div>
                       <div><label className="text-green-400 text-xs uppercase font-bold mb-1 block flex items-center gap-1"><Lock size={12} /> New End Date</label><input type="date" readOnly value={renewalCalculations.newEndDate} className="input-dark w-full bg-dark-300 border-green-500/50 text-green-400 cursor-not-allowed font-bold" /></div>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group mb-3 select-none">
                            <input type="checkbox" name="applyDiscount" checked={renewalSettings.applyDiscount} onChange={handleRenewalChange} className="hidden peer" />
                            <div className="w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center peer-checked:bg-primary-500 peer-checked:border-primary-500">{renewalSettings.applyDiscount && <CheckSquare size={14} className="text-white" />}</div>
                            <span className="text-gray-300 group-hover:text-white">Apply Discount?</span>
                        </label>
                        {renewalSettings.applyDiscount && (<div className="flex items-center gap-3"><span className="text-gray-400">Amount (₹):</span><input type="number" name="discountAmount" onWheel={(e) => e.target.blur()} value={renewalSettings.discountAmount} onChange={handleRenewalChange} placeholder="0" className="input-dark w-40 bg-dark-300 border-primary-500/50" /></div>)}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-6 border-t-4 border-t-primary-500 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Summary</h3>

                {parseInt(renewalSettings.monthsToAdd) > 0 ? (
                    <div className="space-y-4">
                         <div className="p-4 rounded-xl bg-dark-300 border border-gray-700 space-y-2">
                             <div className="flex justify-between text-xs text-gray-500 uppercase font-bold"><span>Duration</span><span>{renewalSettings.monthsToAdd} Months</span></div>
                             {renewalCalculations.isExpired && (<div className="text-xs text-orange-400 mt-1 flex items-center gap-1 border-t border-gray-600 pt-2"><AlertTriangle size={12} /> Plan expired. Renewing from Today.</div>)}
                         </div>
                         <div className="space-y-2 border-t border-gray-700 pt-4">
                            <div className="flex justify-between text-gray-400"><span>Base Price</span><span>₹{renewalCalculations.subTotal}</span></div>
                            {renewalSettings.applyDiscount && (<div className="flex justify-between text-red-400 font-medium"><span>Discount</span><span>- ₹{renewalSettings.discountAmount}</span></div>)}
                            <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-gray-700"><span>To Pay</span><span className="text-primary-400">₹{renewalCalculations.finalTotal}</span></div>
                         </div>
                         <button onClick={handleSubmit} disabled={loading} className="w-full mt-4 btn-primary py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-2"><RefreshCw size={20} /> Confirm Renewal</button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center">
                        <div className="py-8 text-gray-500"><AlertCircle size={40} className="mx-auto mb-2 opacity-30" /><p>Select duration for renewal.</p></div>
                        <button onClick={handleSubmit} disabled={loading} className="w-full btn-secondary py-3 flex items-center justify-center gap-2"><CheckCircle size={18} /> Just Update Info</button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border border-red-900/50 text-red-500 hover:bg-red-900/20 flex items-center justify-center gap-2 font-medium"><Trash2 size={18} /> Cancel Membership</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateUser