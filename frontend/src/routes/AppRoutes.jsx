import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Store } from "../utils/store";

import CustomerLayout from "../customer/components/CustomerLayout";
import Home from "../customer/pages/Home";
import About from "../customer/pages/About";
import Contact from "../customer/pages/Contact";
import Login from "../customer/pages/Login";
import MemberProfile from "../customer/pages/MemberProfile";
import ResetPassword from "../customer/pages/ResetPassword";

import AdminLayout from "../admin/components/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import AddUser from "../admin/pages/AddUser";
import UserList from "../admin/pages/UserList";
import UserProfile from "../admin/pages/UserProfile";
import UpdateUser from "../admin/pages/UpdateUser";

// Global Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-dark-400 flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking); // ✅ Use checking, not isLogging

  if (checking) {
    return <LoadingSpinner />;
  }

  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

// Member Protected Route
const MemberProtectedRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking); // ✅ Use checking, not isLogging

  if (checking) {
    return <LoadingSpinner />;
  }

  if (!user || !user.role) return <Navigate to="/login" replace />;

  return children;
};
const PublicOnlyRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) {
    return <LoadingSpinner />;
  }

  // If user is logged in, redirect them away from login page
  if (user && user.role) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const checkAuth = Store((state) => state.checkAuth);
  const checking = Store((state) => state.checking);

  useEffect(() => {
    checkAuth();
  }, []);

  // Optional: Show global loader while checking auth
  // This prevents any route from rendering until auth is checked
  if (checking) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Customer routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Login should redirect if already authenticated */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        
        <Route path="/set-password" element={<ResetPassword />} />

        <Route
          path="/profile"
          element={
            <MemberProtectedRoute>
              <MemberProfile />
            </MemberProtectedRoute>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add" element={<AddUser />} />
        <Route path="list" element={<UserList />} />
        <Route path="profile/:id" element={<UserProfile />} />
        <Route path="update/:id" element={<UpdateUser />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;