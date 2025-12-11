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
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = Store((state) => state.user);
  console.log(user)
  const logout = Store((state) => state.logout);

  const isLoggedIn = user && user.role;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ============ TOP NAVBAR ============ */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark-400/95 backdrop-blur-xl shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold text-white">
                FIT<span className="text-primary-500">GYM</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-sm font-medium ${
                  isActive("/") ? "text-primary-400" : "text-gray-300 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium ${
                  isActive("/about") ? "text-primary-400" : "text-gray-300 hover:text-white"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium ${
                  isActive("/contact") ? "text-primary-400" : "text-gray-300 hover:text-white"
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Desktop Profile / Login */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-300 hover:bg-dark-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-white capitalize">
                      {user.role}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 ${showProfileMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-300 rounded-xl border border-dark-100 shadow-xl">
                      <div className="p-3 border-b border-dark-100">
                        <p className="text-white font-medium capitalize">{user.role}</p>
                        <p className="text-xs text-gray-400">
                          {isAdmin ? "Administrator" : "Member"}
                        </p>
                      </div>

                      <div className="p-2">
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-200"
                          >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                          </Link>
                        ) : (
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-200"
                          >
                            <UserCircle size={18} />
                            <span>My Profile</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
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
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/contact"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden bg-dark-300 mx-4 mt-2 p-4 rounded-xl border border-dark-100">
            
            {/* Links */}
            <Link
              to="/"
              className={`block px-4 py-3 rounded-lg font-medium mb-1 ${
                isActive("/") ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-dark-200"
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-4 py-3 rounded-lg font-medium mb-1 ${
                isActive("/about") ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-dark-200"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-4 py-3 rounded-lg font-medium ${
                isActive("/contact") ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-dark-200"
              }`}
            >
              Contact
            </Link>

            <div className="h-px bg-dark-100 my-4"></div>

            {/* Profile Section */}
            {isLoggedIn ? (
              <div>
                <div className="flex items-center gap-3 px-4 py-3 bg-dark-200/50 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{user.role}</p>
                    <p className="text-xs text-gray-400">
                      {isAdmin ? "Administrator" : "Member"}
                    </p>
                  </div>
                </div>

                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-dark-200"
                  >
                    <LayoutDashboard size={20} className="text-primary-400" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-dark-200"
                  >
                    <UserCircle size={20} className="text-primary-400" />
                    <span>My Profile</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl bg-red-500/10 text-red-400"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 rounded-xl text-center text-gray-300 bg-dark-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/contact"
                  className="block w-full px-4 py-3 rounded-xl text-center text-white bg-primary-600"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ============ BOTTOM NAVIGATION (Mobile Only) ============ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-400 border-t border-dark-100">
        <div className="flex items-center justify-around py-2 px-4">

          {/* Home */}
          <Link to="/" className="flex flex-col items-center py-2 px-3">
            <Home
              size={22}
              className={isActive("/") ? "text-primary-400" : "text-gray-400"}
            />
            <span
              className={`text-xs mt-1 ${
                isActive("/") ? "text-primary-400" : "text-gray-400"
              }`}
            >
              Home
            </span>
          </Link>

          {/* About */}
          <Link to="/about" className="flex flex-col items-center py-2 px-3">
            <Info
              size={22}
              className={isActive("/about") ? "text-primary-400" : "text-gray-400"}
            />
            <span
              className={`text-xs mt-1 ${
                isActive("/about") ? "text-primary-400" : "text-gray-400"
              }`}
            >
              About
            </span>
          </Link>

          {/* Contact */}
          <Link to="/contact" className="flex flex-col items-center py-2 px-3">
            <Phone
              size={22}
              className={isActive("/contact") ? "text-primary-400" : "text-gray-400"}
            />
            <span
              className={`text-xs mt-1 ${
                isActive("/contact") ? "text-primary-400" : "text-gray-400"
              }`}
            >
              Contact
            </span>
          </Link>

          {/* Profile or Login */}
          {isLoggedIn ? (
            <Link
              to={isAdmin ? "/admin" : "/profile"}
              className="flex flex-col items-center py-2 px-3"
            >
              <User
                size={22}
                className={
                  isActive("/profile") || isActive("/admin")
                    ? "text-primary-400"
                    : "text-gray-400"
                }
              />
              <span
                className={`text-xs mt-1 ${
                  isActive("/profile") || isActive("/admin")
                    ? "text-primary-400"
                    : "text-gray-400"
                }`}
              >
                {isAdmin ? "Admin" : "Profile"}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center py-2 px-3">
              <User
                size={22}
                className={isActive("/login") ? "text-primary-400" : "text-gray-400"}
              />
              <span
                className={`text-xs mt-1 ${
                  isActive("/login") ? "text-primary-400" : "text-gray-400"
                }`}
              >
                Login
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;