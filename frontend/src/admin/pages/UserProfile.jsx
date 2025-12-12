import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { User, Phone, Mail, Calendar, Clock, FileText, Edit, ArrowLeft, Ban, UserCheck, AlertTriangle } from 'lucide-react'
import { Store } from '../../utils/store'

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userList, getAllUser } = Store()
  
  useEffect(() => {
    if (userList.length === 0) getAllUser();
  }, []);

  const member = userList.find(m => m._id === id)

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen">
        <User size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Member Not Found</h2>
        <Link to="/admin/list" className="btn-primary mt-4">Back to List</Link>
      </div>
    )
  }

  const isCancelled = member.iscancel === true;

  const daysRemaining = () => {
    if (!member.end_date) return 0;
    const end = new Date(member.end_date)
    const today = new Date()
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  }

  const days = daysRemaining()

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // --- CANCELLED USER VIEW ---
  if (isCancelled) {
    return (
      <div className="max-w-2xl mx-auto pt-6 pb-12 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back
        </button>

        {/* Cancelled Banner */}
        <div className="card-dark p-6 md:p-8 text-center border-2 border-red-500/30">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-red-500/50 overflow-hidden opacity-70">
              <img src={member.profile_pic || DEFAULT_AVATAR} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
              <Ban size={16} /> Membership Cancelled
            </div>
          </div>

          <h1 className="font-heading text-3xl font-bold text-white mb-2">{member.name}</h1>
          
          <div className="flex flex-col items-center gap-2 text-gray-400 mb-6">
            <a href={`tel:${member.mobile}`} className="flex items-center gap-2 hover:text-primary-400">
              <Phone size={16} /> {member.mobile}
            </a>
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-primary-400">
                <Mail size={16} /> {member.email}
              </a>
            )}
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <p className="text-gray-500 mb-4">This membership has been cancelled. To reactivate, click below.</p>
            <Link 
              to={`/admin/update/${member._id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors"
            >
              <UserCheck size={18} /> Reactivate Membership
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- NORMAL USER VIEW ---
  return (
    <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Back
      </button>

      {/* Profile Header */}
      <div className="card-dark p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <img 
              src={member.profile_pic || DEFAULT_AVATAR}
              alt={member.name}
              className="w-32 h-32 bg-white rounded-full object-cover border-4 border-primary-500"
            />
            <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-dark-200 ${days > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-heading text-3xl font-bold text-white mb-2">{member.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${days > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {days > 0 ? 'Active Member' : 'Expired'}
              </span>
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary-600/20 text-primary-400">
                {member.duration_months || 0} Month Plan
              </span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to={`/admin/update/${member._id}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
                <Edit size={18} /> Edit / Renew
              </Link>
            </div>
          </div>

          <div className={`p-6 rounded-2xl text-center min-w-[140px] ${days > 30 ? 'bg-green-500/10 border border-green-500/30' : days > 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            {days > 0 ? (
              <>
                <p className={`text-4xl font-bold ${days > 30 ? 'text-green-400' : 'text-yellow-400'}`}>{days}</p>
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
        <div className="card-dark p-6">
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-primary-500" /> Contact Info
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center"><Phone size={18} className="text-primary-500" /></div>
              <div>
                <p className="text-gray-400 text-sm">Mobile</p>
                <a href={`tel:${member.mobile}`} className="text-white hover:text-primary-400">{member.mobile}</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center"><Mail size={18} className="text-primary-500" /></div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <a href={`mailto:${member.email}`} className="text-white hover:text-primary-400">{member.email || 'Not provided'}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="card-dark p-6">
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" /> Membership
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center"><Calendar size={18} className="text-green-500" /></div>
              <div>
                <p className="text-gray-400 text-sm">Start Date</p>
                <p className="text-white">{formatDate(member.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center"><Clock size={18} className="text-red-500" /></div>
              <div>
                <p className="text-gray-400 text-sm">End Date</p>
                <p className="text-white">{formatDate(member.end_date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card-dark p-6">
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary-500" /> Notes
        </h2>
        <p className="text-gray-400 leading-relaxed">
          {member.focus_note || 'No notes available.'}
        </p>
      </div>
    </div>
  )
}

export default UserProfile