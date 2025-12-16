// src/admin/components/AdminNavbar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, Dumbbell, User } from 'lucide-react'
import { Store } from '../../utils/store'
const AdminNavbar = ({ onMenuClick }) => {
  // const { user, logout } = useAuth()
  const {logout} = Store()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-300 border-b border-dark-100 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-dark-200 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-neon-orange rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div onClick={()=>{navigate('/') }} className="hidden sm:block">
              <h1 className="font-heading text-lg font-bold text-white">SANATAN GYM</h1>
              <p className="text-xs text-primary-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-200">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{'Admin'}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar