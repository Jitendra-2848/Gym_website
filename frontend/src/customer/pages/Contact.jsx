import React from 'react'
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react'

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Fitness Street', 'Near Central Park', 'Mumbai - 400001']
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 98765 43211'],
      links: ['tel:+919876543210', 'tel:+919876543211']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@sanatan.com', 'support@sanatangym.com'],
      links: ['mailto:info@sanatangym.com', 'mailto:support@sanatangym.com']
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 5:00 AM - 11:00 PM', 'Sunday: 6:00 AM - 8:00 PM']
    }
  ]

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-glow opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-6">
            <MessageSquare size={16} className="text-primary-500" />
            <span className="text-primary-400 font-medium text-sm">Contact Us</span>
          </div>

          <h1 className="section-title text-white mb-6">
            GET IN <span className="text-gradient">TOUCH</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out to us via phone, email, or visit us directly at our center.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="card-dark p-6 text-center group hover:border-primary-500/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                  <info.icon className="text-primary-500 group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    info.links ? (
                      <a 
                        key={idx}
                        href={info.links[idx]}
                        className="block text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        {detail}
                      </a>
                    ) : (
                      <p key={idx} className="text-gray-400">{detail}</p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Responsive Layout: Column on mobile, Row on Large Screens */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">

            {/* Map Section */}
            <div className="w-full lg:flex-1">
              <div className="card-dark overflow-hidden h-full min-h-[300px] lg:min-h-[400px] flex flex-col relative group">
                {/* Embedded Google Map */}
                <iframe 
                  title="Gym Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.792576085532!2d72.8776563149012!3d19.07609098708792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1625641234567!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '300px' }} 
                  allowFullScreen="" 
                  loading="lazy"
                  className="grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                ></iframe>
                
                {/* Overlay Text */}
                <div className="absolute bottom-4 left-4 bg-dark-200/90 backdrop-blur-md p-3 rounded-lg border border-gray-700">
                  <p className="text-white text-sm font-bold flex items-center gap-2">
                    <MapPin size={14} className="text-primary-500"/> Mumbai, India
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Section */}
            <div className="w-full lg:flex-1">
              <div className="card-dark p-8 h-full flex flex-col justify-center">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white mb-2">Quick Connect</h3>
                  <p className="text-gray-400 mb-8">
                    Prefer to talk directly? Connect with us instantly via phone or WhatsApp.
                  </p>

                  <div className="space-y-4">
                    {/* Phone Button */}
                    <a
                      href="tel:+919876543210"
                      className="flex items-center gap-5 p-5 rounded-2xl bg-dark-300 border border-transparent hover:border-primary-500/30 hover:bg-dark-200 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300">
                        <Phone className="text-primary-500 group-hover:text-white transition-colors" size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg">Call Now</p>
                        <p className="text-gray-400 text-sm">+91 98765 43210</p>
                      </div>
                      <ExternalLink className="text-gray-600 group-hover:text-primary-500 transition-colors" size={18} />
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 p-5 rounded-2xl bg-dark-300 border border-transparent hover:border-green-500/30 hover:bg-dark-200 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center group-hover:bg-green-600 transition-all duration-300">
                        <MessageSquare className="text-green-500 group-hover:text-white transition-colors" size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg">WhatsApp</p>
                        <p className="text-gray-400 text-sm">Chat with us instantly</p>
                      </div>
                      <ExternalLink className="text-gray-600 group-hover:text-green-500 transition-colors" size={18} />
                    </a>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact