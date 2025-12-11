import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Store } from '../../utils/store'
import { 
    LogOut, 
    User, 
    LayoutDashboard,
    ChevronDown,
    UserCircle,
    Menu,
    X
} from 'lucide-react'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    
    const profileMenuRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    const user = Store((state) => state.user)
    const logout = Store((state) => state.logout)

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' }
    ]

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsOpen(false)
        setShowProfileMenu(false)
    }, [location])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await logout()
        setShowProfileMenu(false)
        navigate('/login')
    }

    const isActivePath = (path) => {
        return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    }

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-dark-400/95 backdrop-blur-xl shadow-lg py-2' 
                    : 'bg-transparent py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        <Link to="/" className="flex items-center gap-2">
                            <span className="font-heading text-2xl font-bold text-white">
                                FIT<span className="text-primary-500">GYM</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors duration-200 ${
                                        isActivePath(link.path)
                                            ? 'text-primary-400'
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:block">
                            {user && user.role ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-300 hover:bg-dark-200 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                                            <User size={16} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white capitalize">
                                            {user.role}
                                        </span>
                                        <ChevronDown 
                                            size={16} 
                                            className={`text-gray-400 transition-transform duration-200 ${
                                                showProfileMenu ? 'rotate-180' : ''
                                            }`} 
                                        />
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-dark-300 rounded-xl border border-dark-100 shadow-xl overflow-hidden">
                                            
                                            <div className="p-3 border-b border-dark-100">
                                                <p className="text-white font-medium capitalize">{user.role}</p>
                                                <p className="text-xs text-gray-400">
                                                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                                                </p>
                                            </div>

                                            <div className="p-2">
                                                {user.role === 'admin' ? (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-200 hover:text-white transition-colors"
                                                    >
                                                        <LayoutDashboard size={18} />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-200 hover:text-white transition-colors"
                                                    >
                                                        <UserCircle size={18} />
                                                        <span>My Profile</span>
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut size={18} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        to="/login" 
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/contact" 
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg text-white"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden bg-dark-300 mx-4 mt-2 p-4 rounded-xl border border-dark-100">
                        
                        <div className="space-y-1 mb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                                        isActivePath(link.path)
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-300 hover:bg-dark-200'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-dark-100 to-transparent my-4"></div>

                        {user && user.role ? (
                            <div className="space-y-2">
                                
                                <div className="flex items-center gap-3 px-4 py-3 bg-dark-200/50 rounded-xl mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium capitalize">{user.role} User</p>
                                        <p className="text-xs text-gray-500">
                                            {user.role === 'admin' ? 'Administrator' : 'Member'}
                                        </p>
                                    </div>
                                </div>

                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-dark-200 transition-all"
                                    >
                                        <LayoutDashboard size={20} className="text-primary-400" />
                                        <span>Dashboard</span>
                                    </Link>
                                )}

                                {user.role === 'member' && (
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-dark-200 transition-all"
                                    >
                                        <UserCircle size={20} className="text-primary-400" />
                                        <span>My Profile</span>
                                    </Link>
                                )}
                                {/* we have to make the setting page so user cna also chnage its detail like photo name */}
                                {/* <Link
                                    to="/settings"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-dark-200 transition-all"
                                >
                                    <Settings size={20} className="text-gray-400" />
                                    <span>Settings</span>
                                </Link> */}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="block w-full px-4 py-3 rounded-xl text-center font-medium text-gray-300 bg-dark-200 hover:bg-dark-100 transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/contact"
                                    className="block w-full px-4 py-3 rounded-xl text-center font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-neon-orange transition-all shadow-lg shadow-primary-600/20"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}

export default Navbar