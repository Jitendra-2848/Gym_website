import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Store } from '../../utils/store'
import { Dumbbell, AlertCircle, User, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react'

const Login = () => {
    const [formData, setFormData] = useState({ mobile: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    
    const navigate = useNavigate()
    const location = useLocation()

    // Store State
    const user = Store((state) => state.user)
    const isLogging = Store((state) => state.isLogging)
    const errorMessage = Store((state) => state.errorMessage)
    
    // Store Actions
    const login = Store((state) => state.login)
    const clearError = Store((state) => state.clearError)

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin', { replace: true })
            } else if (user.role === 'member') {
                if (user.isFirstLogin) {
                    navigate('/set-password', { replace: true })
                } else {
                    // Check if there was a previous page the user tried to visit
                    const from = location.state?.from?.pathname || '/profile';
                    navigate(from, { replace: true })
                }
            }
        }
    }, [user, navigate, location])

    // Clear errors on mount
    useEffect(() => {
        clearError()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errorMessage) {
            clearError()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.mobile || !formData.password) {
            return
        }

        const result = await login(formData)

        if (result && result.success) {
            // Navigation is handled by the useEffect above looking at the 'user' state
            // or we can force it here for faster UX
            const loggedInUser = result.user;
            
            if (loggedInUser.role === 'admin') {
                navigate('/admin')
            } else {
                if (loggedInUser.isFirstLogin) {
                    navigate('/set-password')
                } else {
                    navigate('/profile')
                }
            }
        }
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4 bg-dark-400">
            <div className="absolute inset-0 bg-orange-glow opacity-10 pointer-events-none"></div>
            
            <div className="relative w-full max-w-md">
                <div className="card-dark p-8 md:p-10 border border-dark-100 rounded-2xl bg-dark-300 shadow-2xl">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-neon-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                            <Dumbbell className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="font-heading text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to access your dashboard</p>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fadeIn">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <span className="text-red-400 text-sm">{errorMessage}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-400 text-white pl-12 pr-4 py-3 rounded-xl border border-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600"
                                    placeholder="Enter your registered mobile"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-400 text-white pl-12 pr-12 py-3 rounded-xl border border-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLogging}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {isLogging ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Not a member yet?{' '}
                            <Link to="/contact" className="text-primary-400 hover:text-primary-300 font-medium hover:underline">
                                Join Now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login