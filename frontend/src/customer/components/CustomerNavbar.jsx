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

  const user = Store((state) => state.user);
  const logout = Store((state) => state.logout);
  const checkAuth = Store((state) => state.checkAuth);

  const isLoggedIn = user && user.role;
  const isAdmin = user?.role === "admin";

  /* ========= SCROLL TO TOP ========= */
  const goToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  /* ========= SCROLL EFFECT ========= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ========= CLOSE MENUS ON ROUTE CHANGE ========= */
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  /* ========= CLOSE PROFILE MENU ON OUTSIDE CLICK ========= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ========= HYDRATE USER ========= */
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
            <Link to="/" onClick={goToTop} className="flex items-center gap-2 md:gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-neon-orange rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <Dumbbell className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>

              <div>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-white">
                  SANATAN
                </h1>
                <p className="text-[10px] md:text-xs text-primary-400 font-semibold tracking-widest">
                  GYM & FITNESS
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

            {/* Desktop Auth */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  {/* unchanged */}
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
                    className="relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                               bg-gradient-to-r from-primary-600 to-primary-500
                               hover:from-primary-500 hover:to-primary-400
                               shadow-lg shadow-primary-500/25 transition-all duration-300
                               before:absolute before:top-0 before:-left-full before:h-full before:w-full
                               before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                               before:skew-x-12 before:transition-all before:duration-700
                               hover:before:left-full"
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
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ========= MOBILE DROPDOWN ========= */}
        {isOpen && (
          <div className="md:hidden overflow-hidden transition-all duration-300">
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

              {/* ========= MOBILE AUTH (ONLY WHEN OPEN) ========= */}
              {!isLoggedIn && (
                <div className="mt-2 pt-2 border-t border-dark-100 flex gap-2 p-2">
                  <Link
                    to="/login"
                    onClick={goToTop}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-gray-300 bg-dark-200 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/contact"
                    onClick={goToTop}
                    className="relative overflow-hidden flex-1 py-2.5 text-center text-sm font-semibold text-white
                               bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg
                               before:absolute before:top-0 before:-left-full before:h-full before:w-full
                               before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                               before:skew-x-12 before:transition-all before:duration-700
                               hover:before:left-full"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default Navbar;
