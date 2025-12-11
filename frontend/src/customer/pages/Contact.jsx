// src/customer/pages/Contact.jsx
import React, { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    
    setTimeout(() => setSubmitted(false), 5000)
  }

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
      <section className="py-20 md:py-32 relative overflow-hidden">
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
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="card-dark p-6 text-center group hover:border-primary-500/50">
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
    
    {/* Make both cards equal width + equal height */}
    <div className="flex gap-12 items-stretch">

      {/* Map Section */}
      <div className="flex-1 h-full">
        <div className="card-dark overflow-hidden h-full min-h-[380px] flex flex-col">
          <div className="w-full h-full bg-dark-200 flex items-center justify-center relative flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-neon-orange/10"></div>
            <div className="text-center relative z-10">
              <MapPin size={48} className="text-primary-500 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-white mb-2">Find Us Here</h3>
              <p className="text-gray-400">123 Fitness Street, Mumbai</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-primary-400 hover:text-primary-300 font-medium"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex-1 h-full">
        <div className="card-dark p-6 h-full min-h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Quick Contact</h3>
            <div className="space-y-4">

              <a
                href="tel:+919876543210"
                className="flex items-center gap-4 p-4 rounded-xl bg-dark-300 hover:bg-dark-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <Phone className="text-primary-500 group-hover:text-white transition-colors" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">Call Now</p>
                  <p className="text-gray-400 text-sm">+91 98765 43210</p>
                </div>
              </a>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-dark-300 hover:bg-dark-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <MessageSquare className="text-green-500 group-hover:text-white transition-colors" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">WhatsApp</p>
                  <p className="text-gray-400 text-sm">Chat with us instantly</p>
                </div>
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