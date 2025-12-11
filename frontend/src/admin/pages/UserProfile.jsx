// src/admin/pages/UserProfile.jsx
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { members } from '../../data/mockData'

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const member = members.find(m => m.id === id)

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Member Not Found</h2>
        <p className="text-gray-400 mb-6">The member you're looking for doesn't exist.</p>
        <Link to="/admin/list" className="btn-primary">
          Back to List
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setDeleting(false)
    setShowDeleteModal(false)
    navigate('/admin/list')
  }

  const daysRemaining = () => {
    const end = new Date(member.endDate)
    const today = new Date()
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const days = daysRemaining()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Profile Header */}
      <div className="card-dark p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Photo */}
          <div className="relative">
            <img 
              src={member.photoUrl}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
            />
            <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-dark-200 ${
              member.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-heading text-3xl font-bold text-white mb-2">{member.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                member.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {member.status === 'active' ? 'Active Member' : 'Expired'}
              </span>
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary-600/20 text-primary-400">
                {member.plan} Plan
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link 
                to={`/admin/update/${member.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
              >
                <Edit size={18} />
                Edit Profile
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className={`p-6 rounded-2xl text-center ${
            days > 30 
              ? 'bg-green-500/10 border border-green-500/30' 
              : days > 0 
                ? 'bg-yellow-500/10 border border-yellow-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {days > 0 ? (
              <>
                <p className={`text-4xl font-bold ${days > 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {days}
                </p>
                <p className="text-gray-400 text-sm">Days Left</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-red-400">{Math.abs(days)}</p>
                <p className="text-gray-400 text-sm">Days Overdue</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Contact Info */}
        <div className="card-dark p-6">
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-primary-500" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                <Phone size={18} className="text-primary-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mobile</p>
                <a href={`tel:${member.mobile}`} className="text-white hover:text-primary-400 transition-colors">
                  {member.mobile}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                <Mail size={18} className="text-primary-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <a href={`mailto:${member.email}`} className="text-white hover:text-primary-400 transition-colors">
                  {member.email || 'Not provided'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="card-dark p-6">
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" />
            Membership Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Start Date</p>
                <p className="text-white">{member.startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Clock size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">End Date</p>
                <p className="text-white">{member.endDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card-dark p-6">
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary-500" />
          Notes
        </h2>
        <p className="text-gray-400 leading-relaxed">
          {member.notes || 'No notes available for this member.'}
        </p>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card-dark p-6 max-w-md w-full animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Delete Member?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <span className="text-white font-medium">{member.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-lg bg-dark-200 text-gray-300 font-medium hover:bg-dark-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile