import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store } from "../../utils/store";
import {
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  UserCircle,
  Menu,
  X,
  Home,
  Info,
  Phone,
  Dumbbell,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Store Hooks
  const user = Store((state) => state.user);
  const logout = Store((state) => state.logout);
  const checkAuth = Store((state) => state.checkAuth); // Imported to refresh user data

  const isLoggedIn = user && user.role;
  const isAdmin = user?.role === "admin";

  /* ========= SCROLL TO TOP ========= */
  const goToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FIX: Hydrate User Name
  // If user is logged in but name is missing (common after immediate login),
  // trigger a checkAuth to fetch full profile details.
  useEffect(() => {
    if (user && !user.name && !isAdmin) {
      checkAuth();
    }
  }, [user, checkAuth, isAdmin]);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate("/login");
    goToTop();
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Bottom Navigation Items
  const bottomNavItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/about", icon: Info, label: "About" },
    { path: "/contact", icon: Phone, label: "Contact" },
    {
      path: isLoggedIn ? (isAdmin ? "/admin" : "/profile") : "/login",
      icon: User,
      label: isLoggedIn ? (isAdmin ? "Admin" : "Profile") : "Login",
    },
  ];
  return (
    <>
      {/* ============ TOP NAVBAR ============ */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark-400/95 backdrop-blur-xl shadow-lg py-2"
            : "bg-transparent py-3 md:py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link
              to="/"
              onClick={goToTop}
              className="flex items-center gap-2 md:gap-3 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-neon-orange rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <Dumbbell className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>

              <div>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-white">
                  SANATAN
                </h1>
                <p className="text-[10px] md:text-xs text-primary-400 font-semibold tracking-widest">
                  GYM &amp; FITNESS
                </p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={goToTop}
                  className={`relative text-sm font-medium transition-colors duration-300 ${
                    isActive(item.path)
                      ? "text-primary-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Profile / Login */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-4 px-3 py-2 rounded-xl bg-dark-300 hover:bg-dark-200 transition-colors duration-300 border border-dark-100"
                  >
                    {/* ✅ ADDED LOGIC HERE: Show Pic or User Icon */}
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt="Profile"
                        className="aspect-[1] h-10 rounded-full object-cover border border-dark-50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}

                    {/* User Name Display */}
                    <span className="text-sm font-medium text-white capitalize hidden sm:block">
                      {user.name ? user.name : user.role}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-dark-300 rounded-xl border border-dark-100 shadow-2xl overflow-hidden transition-all duration-300 origin-top-right z-50 ${
                      showProfileMenu
                        ? "opacity-100 scale-100 visible"
                        : "opacity-0 scale-95 invisible"
                    }`}
                  >
                    <div className="p-4 border-b border-dark-100 bg-dark-200/50">
                      <div className="flex items-center gap-3">
                        {/* Avatar Logic Inside Dropdown */}
                        {user.profile_pic ? (
                          <img
                            src={user.profile_pic}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                        )}

                        {/* Text Info */}
                        <div>
                          <p className="text-white font-medium capitalize truncate max-w-[120px]">
                            {user.name || "Member"}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={goToTop}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-dark-200 hover:text-white transition-colors duration-200"
                        >
                          <LayoutDashboard size={18} />
                          <span>Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          onClick={goToTop}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-dark-200 hover:text-white transition-colors duration-200"
                        >
                          <UserCircle size={18} />
                          <span>My Profile</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    onClick={goToTop}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/contact"
                    onClick={goToTop}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 transition-all duration-300"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-white bg-dark-300/50 hover:bg-dark-300 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-dark-300/95 backdrop-blur-xl mx-4 mt-2 p-2 rounded-xl border border-dark-100 shadow-xl">
            {[
              { path: "/", label: "Home", icon: Home },
              { path: "/about", label: "About", icon: Info },
              { path: "/contact", label: "Contact", icon: Phone },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={goToTop}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-primary-500/20 text-primary-400"
                    : "text-gray-300 hover:bg-dark-200 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="mt-2 pt-2 border-t border-dark-100">
              {isLoggedIn ? (
                <>
                  <Link
                    to={isAdmin ? "/admin" : "/profile"}
                    onClick={goToTop}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-200 hover:text-white transition-colors duration-200"
                  >
                    {isAdmin ? (
                      <LayoutDashboard size={18} />
                    ) : (
                      <UserCircle size={18} />
                    )}
                    <span className="font-medium">
                      {isAdmin ? "Dashboard" : "My Profile"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 p-2">
                  <Link
                    to="/login"
                    onClick={goToTop}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-gray-300 bg-dark-200 hover:bg-dark-100 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/contact"
                    onClick={goToTop}
                    className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg transition-colors duration-200"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============ BOTTOM NAVIGATION (Mobile Only) ============ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Gradient overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/95 to-dark-400/90 backdrop-blur-lg" />

        {/* Safe area for devices with home indicator */}
        <div className="relative border-t border-dark-100/50">
          <div className="flex items-center justify-around px-2 pt-2 pb-safe">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const Active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={goToTop}
                  className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-all duration-300 ${
                    Active
                      ? "text-primary-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {/* Icon with Active indicator */}
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={Active ? 2.5 : 2}
                      className={`transition-transform duration-300 ${
                        Active ? "scale-110" : ""
                      }`}
                    />
                    {/* Active dot indicator */}
                    {Active && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-1 text-[10px] font-medium transition-all duration-300 ${
                      Active ? "text-primary-400" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Bottom safe area padding for iOS */}
          <div className="h-safe bg-dark-400" />
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default Navbar;
