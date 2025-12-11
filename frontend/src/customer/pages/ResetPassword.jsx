import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from '../../utils/store'
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { api } from '../../utils/axios'

const ResetPassword = () => {
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const navigate = useNavigate()
    const user = Store((state) => state.user)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (error) setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.newPassword || !form.confirmPassword) return setError('Please fill both fields')
        if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match')

        const mobile = user?.mobile
        if (!mobile) return setError('Mobile number not found. Please login again.')

        try {
            setLoading(true)
            const res = await api.post('/api/auth/set-password', { mobile, newPassword: form.newPassword })
            if (res.data && res.data.success) {
                navigate('/')
            } else {
                setError(res.data?.message || 'Failed to set password')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4">
            <div className="absolute inset-0 bg-orange-glow opacity-20"></div>
            <div className="relative w-full max-w-md">
                <div className="card-dark p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-2xl font-bold text-white mb-2">Set New Password</h2>
                        <p className="text-gray-400">Enter a new password</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    required
                                    className="input-dark pl-12 pr-12"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="input-dark pl-12 pr-12"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Setting...
                                </>
                            ) : (
                                <>
                                    Set Password
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">After setting your password you'll be redirected to the home page.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
