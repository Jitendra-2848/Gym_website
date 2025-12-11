import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from '../../utils/store'
import { User, Calendar, Phone, Mail, DollarSign, AlertCircle, LogOut } from 'lucide-react'

const MemberProfile = () => {
    const navigate = useNavigate()
    
    const user = Store((state) => state.user)
    const memberProfile = Store((state) => state.memberProfile)
    const profileLoading = Store((state) => state.profileLoading)
    const logout = Store((state) => state.logout)
    const getMemberProfile = Store((state) => state.getMemberProfile)

    useEffect(() => {
        getMemberProfile()
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                
                <div className="card-dark p-6 md:p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-primary-600/20 flex items-center justify-center mb-4">
                            <User size={48} className="text-primary-500" />
                        </div>
                        <h1 className="font-heading text-2xl font-bold text-white">Member Profile</h1>
                        <span className="px-4 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 mt-2">
                            Active Member
                        </span>
                    </div>

                    {profileLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : memberProfile ? (
                        <div className="space-y-4 mb-8">
                            {/* Name */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                                    <User size={18} className="text-primary-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Name</p>
                                    <p className="text-white font-medium">{memberProfile.name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                    <Phone size={18} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Mobile</p>
                                    <p className="text-white font-medium">{memberProfile.mobile || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                                    <Mail size={18} className="text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white font-medium">{memberProfile.email || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Membership Duration */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                    <Calendar size={18} className="text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Membership Duration</p>
                                    <p className="text-white font-medium">{memberProfile.duration_months} months</p>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                                    <Calendar size={18} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Start Date</p>
                                    <p className="text-white font-medium">{memberProfile.start_date || 'N/A'}</p>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                                    <Calendar size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">End Date</p>
                                    <p className="text-white font-medium">{memberProfile.end_date || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Days Remaining */}
                            {memberProfile.daysRemaining !== undefined && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                                        <AlertCircle size={18} className="text-cyan-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Days Remaining</p>
                                        <p className="text-white font-medium">{memberProfile.daysRemaining} days</p>
                                    </div>
                                </div>
                            )}

                            {/* Amount Paid */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                                    <DollarSign size={18} className="text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Amount Paid</p>
                                    <p className="text-white font-medium">₹{memberProfile.amount_paid || '0'}</p>
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
                                    <DollarSign size={18} className="text-pink-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Discount</p>
                                    <p className="text-white font-medium">₹{memberProfile.discount || '0'}</p>
                                </div>
                            </div>

                            {/* Focus Note */}
                            {memberProfile.focus_note && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-dark-200">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mt-1">
                                        <AlertCircle size={18} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Focus Note</p>
                                        <p className="text-white font-medium">{memberProfile.focus_note}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200">
                                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                                    <AlertCircle size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Status</p>
                                    <p className={`font-medium ${memberProfile.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                        {memberProfile.status || 'Active'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-12">
                            <p>Unable to load profile information</p>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MemberProfile