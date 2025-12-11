// src/admin/pages/UpdateUser.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Upload, X, CheckCircle, AlertCircle, ArrowLeft, User } from 'lucide-react'
import { members } from '../../data/mockData'

const UpdateUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const member = members.find(m => m.id === id)
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    startDate: '',
    endDate: '',
    duration: '',
    notes: ''
  })

  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        mobile: member.mobile,
        email: member.email || '',
        startDate: member.startDate,
        endDate: member.endDate,
        plan: member.plan,
        notes: member.notes || ''
      })
      setPhotoPreview(member.photoUrl)
    }
  }, [member])

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Member Not Found</h2>
        <p className="text-gray-400 mb-6">The member you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/admin/list')} className="btn-primary">
          Back to List
        </button>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.mobile.match(/^\d{10}$/)) return 'Valid 10-digit mobile number is required'
    if (!formData.startDate) return 'Start date is required'
    if (!formData.endDate) return 'End date is required'
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return 'End date must be after start date'
    }
    if (!formData.plan) return 'Please select a plan'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setLoading(false)
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
      navigate(`/admin/profile/${id}`)
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Edit className="text-primary-500" size={32} />
          Update Member
        </h1>
        <p className="text-gray-400 mt-2">Update the details for {member.name}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-green-400">Member updated successfully! Redirecting...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="card-dark p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                  />
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-500 transition-colors">
                    <Edit size={16} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="w-32 h-32 rounded-full border-2 border-dashed border-dark-100 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload size={24} className="text-gray-500 mb-2" />
                  <span className="text-gray-500 text-xs">Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-dark"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className="input-dark"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-dark"
              placeholder="Optional email address"
            />
          </div>

          {/* Membership Details */}
          {/* <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-dark"
              />
            </div>
          </div> */}
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


          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input-dark resize-none"
              placeholder="Any additional notes about the member..."
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 rounded-lg bg-dark-200 text-gray-300 font-heading font-semibold uppercase tracking-wider hover:bg-dark-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Update Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateUser