// src/customer/components/CustomerNavbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Dumbbell, Home, Info, Phone, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const CustomerNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-dark-400/95 backdrop-blur-lg shadow-lg shadow-black/20' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-neon-orange rounded-xl flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className="font-heading text-2xl font-bold text-white">SANATAN</h1>
                <p className="text-xs text-primary-400 font-semibold tracking-widest">GYM &amp; FITNESS</p>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors duration-300 relative group ${
                    location.pathname === link.path ? 'text-primary-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary-500 transition-all duration-300 ${
                      location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2"
                    >
                      <User size={18} />
                      Admin Panel
                    </Link>
                  )}

                  <button onClick={handleLogout} className="btn-secondary !py-2 !px-6 flex items-center gap-2">
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                /* LOGIN BUTTON: shine only, no lift/scale */
                <Link
                  to="/login"
                  className="btn-primary !py-2 !px-6 flex items-center gap-2 border border-transparent
                             relative overflow-hidden hover:bg-primary-500 hover:border-white/30
                             transition-all duration-200 group hover:translate-y-0 hover:scale-100"
                >
                  <LogIn size={18} />
                  Login

                  {/* Shine Sweep */}
                  <span
                    className="absolute inset-0 w-1/3 h-full bg-white/20 transform -skew-x-12 translate-x-[-150%]
                               group-hover:translate-x-[250%] transition-all duration-700 ease-out pointer-events-none"
                  ></span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-dark-200 text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-dark-300/95 backdrop-blur-lg border-t border-dark-100 px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-300 hover:bg-dark-200'
                }`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-dark-100">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => {
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-400 hover:bg-dark-200"
                    >
                      <User size={20} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-200 w-full"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                /* MOBILE LOGIN BUTTON: shine only, no lift/scale */
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600 text-white
                             border border-transparent relative overflow-hidden group
                             hover:bg-primary-500 hover:border-white/30 transition-all duration-200
                             hover:translate-y-0 hover:scale-100"
                >
                  <LogIn size={20} />
                  Login

                  <span
                    className="absolute inset-0 w-1/3 h-full bg-white/20 transform -skew-x-12 translate-x-[-150%]
                               group-hover:translate-x-[250%] transition-all duration-700 ease-out pointer-events-none"
                  ></span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-300/95 backdrop-blur-lg border-t border-dark-100">
        <div className="flex justify-around items-center py-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === link.path ? 'text-primary-400' : 'text-gray-400'
              }`}
            >
              <link.icon size={20} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}

          <Link
            to={user ? '/admin' : '/login'}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/login' || location.pathname.startsWith('/admin')
                ? 'text-primary-400'
                : 'text-gray-400'
            }`}
          >
            <User size={20} />
            <span className="text-xs font-medium">{user ? 'Account' : 'Login'}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default CustomerNavbar
