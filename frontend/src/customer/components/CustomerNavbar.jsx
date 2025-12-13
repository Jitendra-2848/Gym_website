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
  const logout = Store((state) => state.logout);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
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
    goToTop();
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
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
            <Link to="/" onClick={goToTop} className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold text-white">
                FIT<span className="text-primary-500">GYM</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                onClick={goToTop}
                className={`text-sm font-medium ${
                  isActive("/") ? "text-primary-400" : "text-gray-300 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={goToTop}
                className={`text-sm font-medium ${
                  isActive("/about") ? "text-primary-400" : "text-gray-300 hover:text-white"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={goToTop}
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
                      className={`text-gray-400 ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-300 rounded-xl border border-dark-100 shadow-xl">
                      <div className="p-3 border-b border-dark-100">
                        <p className="text-white font-medium capitalize">
                          {user.role}
                        </p>
                        <p className="text-xs text-gray-400">
                          {isAdmin ? "Administrator" : "Member"}
                        </p>
                      </div>

                      <div className="p-2">
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={goToTop}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-200"
                          >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                          </Link>
                        ) : (
                          <Link
                            to="/profile"
                            onClick={goToTop}
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
                    onClick={goToTop}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/contact"
                    onClick={goToTop}
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
            <Link to="/" onClick={goToTop} className="block px-4 py-3">Home</Link>
            <Link to="/about" onClick={goToTop} className="block px-4 py-3">About</Link>
            <Link to="/contact" onClick={goToTop} className="block px-4 py-3">Contact</Link>
          </div>
        )}
      </nav>

      {/* ============ BOTTOM NAVIGATION (Mobile Only) ============ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-400 border-t border-dark-100">
        <div className="flex items-center justify-around py-2 px-4">
          <Link to="/" onClick={goToTop}><Home size={22} /></Link>
          <Link to="/about" onClick={goToTop}><Info size={22} /></Link>
          <Link to="/contact" onClick={goToTop}><Phone size={22} /></Link>
          <Link to={isLoggedIn ? (isAdmin ? "/admin" : "/profile") : "/login"} onClick={goToTop}>
            <User size={22} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
