import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

// ================= LOADING =================
const LoadingSpinner = () => (
  <div className="min-h-screen bg-dark-400 flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ================= PROTECTED ROUTES =================
const AdminProtectedRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) return <LoadingSpinner />;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return children;
};

const MemberProtectedRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) return <LoadingSpinner />;
  if (!user || !user.role) return <Navigate to="/login" replace />;

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) return <LoadingSpinner />;

  if (user && user.role) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/profile" replace />;
  }

  return children;
};

// ================= ROUTES =================
const AppRoutes = () => {
  const checkAuth = Store((state) => state.checkAuth);
  const checking = Store((state) => state.checking);

  useEffect(() => {
    checkAuth();
  }, []);

  if (checking) return <LoadingSpinner />;

  return (
    <Routes>

      {/* 🔹 CUSTOMER ROUTES (Navbar always visible) */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/set-password" element={<ResetPassword />} />

        {/* ✅ LOGIN INSIDE CUSTOMER LAYOUT */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <MemberProtectedRoute>
              <MemberProfile />
            </MemberProtectedRoute>
          }
        />
      </Route>

      {/* 🔹 ADMIN ROUTES */}
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
