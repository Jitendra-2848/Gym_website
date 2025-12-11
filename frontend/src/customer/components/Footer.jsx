// src/customer/components/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark-300 border-t border-dark-100 pb-20 md:pb-0">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-neon-orange rounded-xl flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-white">SANATAN</h1>
                <p className="text-xs text-primary-400 font-semibold tracking-widest">GYM & FITNESS</p>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Transform your body, transform your life. Join our community of fitness enthusiasts and achieve your goals with expert guidance.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-6">QUICK LINKS</h3>
            <ul className="space-y-4">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },,
                { label: 'Contact', path: '/contact' },
                { label: 'Login', path: '/login' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-6">CONTACT US</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="text-primary-500 mt-1 flex-shrink-0" />
                <span>123 Fitness Street, Near Central Park, Mumbai - 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-primary-400 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary-500 flex-shrink-0" />
                <a href="mailto:info@sanatangym.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                  info@sanatangym.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Clock size={20} className="text-primary-500 mt-1 flex-shrink-0" />
                <div>
                  <p>Mon - Sat: 5:00 AM - 11:00 PM</p>
                  <p>Sunday: 6:00 AM - 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Sanatan Gym. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer