// src/routes/AppRoutes.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Customer Pages
import CustomerLayout from '../customer/components/CustomerLayout'
import Home from '../customer/pages/Home'
import About from '../customer/pages/About'
import Contact from '../customer/pages/Contact'
import Login from '../customer/pages/Login'

// Admin Pages
import AdminLayout from '../admin/components/AdminLayout'
import Dashboard from '../admin/pages/Dashboard'
import AddUser from '../admin/pages/AddUser'
import UserList from '../admin/pages/UserList'
import UserProfile from '../admin/pages/UserProfile'
import UpdateUser from '../admin/pages/UpdateUser'


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="add" element={<AddUser />} />
        <Route path="list" element={<UserList />} />
        <Route path="profile/:id" element={<UserProfile />} />
        <Route path="update/:id" element={<UpdateUser />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes