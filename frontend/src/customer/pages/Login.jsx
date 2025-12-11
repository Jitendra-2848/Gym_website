import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Store } from '../../utils/store'
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

const Login = () => {
    const [formData, setFormData] = useState({ mobile: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showSetPasswordPrompt, setShowSetPasswordPrompt] = useState(false)

    const navigate = useNavigate()

    const user = Store((state) => state.user)
    const isLogging = Store((state) => state.isLogging)
    const errorMessage = Store((state) => state.errorMessage)
    const login = Store((state) => state.login)
    const clearError = Store((state) => state.clearError)

    useEffect(() => {
        if (user && user.role) {
            if (user.role === 'admin') {
                navigate('/admin')
            } else if (user.role === 'member') {
                if (user.isFirstLogin) {
                    setShowSetPasswordPrompt(true)
                    navigate('/login')
                } else {
                    navigate('/')
                }
            }
        }
    }, [user, navigate])

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

        if (result && result.success === true) {
            if (result.role === 'admin') {
                navigate('/admin')
            } else if (result.role === 'member') {
                if (result.isFirstLogin) {
                    // show an inline prompt so user can choose to set password
                    setShowSetPasswordPrompt(true)
                } else {
                    navigate('/')
                }
            }
        }
    }

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4">
            <div className="absolute inset-0 bg-orange-glow opacity-20"></div>
            <div className="relative w-full max-w-md">
                <div className="card-dark p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to access your account</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <span className="text-red-400">{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mobile</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    className="input-dark pl-12"
                                    placeholder="Enter your Mobile no."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="input-dark pl-12 pr-12"
                                    placeholder="Enter your password"
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
                        <button
                            type="submit"
                            disabled={isLogging}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLogging ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                  

                    <div className="mt-8 text-center">
                        {showSetPasswordPrompt ? (
                            <p className="text-gray-400">
                                Looks like new login?{' '}
                                <Link to="/set-password" className="text-primary-400 hover:text-primary-300 font-medium">
                                    Reset Password
                                </Link>
                            </p>
                        ) : (
                            <p className="text-gray-400">
                                Not a member yet?{' '}
                                <Link to="/contact" className="text-primary-400 hover:text-primary-300 font-medium">
                                    Join Now
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login