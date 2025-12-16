import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Store } from "../utils/store";

// ================= LAYOUTS (Load immediately) =================
import CustomerLayout from "../customer/components/CustomerLayout";
import AdminLayout from "../admin/components/AdminLayout";

// ================= LAZY LOAD PAGES (Load only when needed) =================
const Home = lazy(() => import("../customer/pages/Home"));
const About = lazy(() => import("../customer/pages/About"));
const Contact = lazy(() => import("../customer/pages/Contact"));
const Login = lazy(() => import("../customer/pages/Login"));
const MemberProfile = lazy(() => import("../customer/pages/MemberProfile"));
const ResetPassword = lazy(() => import("../customer/pages/ResetPassword"));

const Dashboard = lazy(() => import("../admin/pages/Dashboard"));
const AddUser = lazy(() => import("../admin/pages/AddUser"));
const UserList = lazy(() => import("../admin/pages/UserList"));
const UserProfile = lazy(() => import("../admin/pages/UserProfile"));
const UpdateUser = lazy(() => import("../admin/pages/UpdateUser"));

// ================= LOADING SPINNER =================
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// ================= PAGE LOADER (For Suspense) =================
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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

const FirstLoginRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) return <LoadingSpinner />;
  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && user.isFirstLogin === false) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const user = Store((state) => state.user);
  const checking = Store((state) => state.checking);

  if (checking) return <LoadingSpinner />;

  if (user && user.role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.isFirstLogin === true) return <Navigate to="/set-password" replace />;
    return <Navigate to="/profile" replace />;
  }

  return children;
};

// ================= MAIN ROUTES =================
const AppRoutes = () => {
  const checkAuth = Store((state) => state.checkAuth);
  const checking = Store((state) => state.checking);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show spinner only during initial auth check
  if (checking) return <LoadingSpinner />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* 🔹 CUSTOMER ROUTES */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/set-password"
            element={
              <FirstLoginRoute>
                <ResetPassword />
              </FirstLoginRoute>
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;