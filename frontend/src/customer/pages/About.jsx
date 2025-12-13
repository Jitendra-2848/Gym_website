// src/customer/pages/About.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Dumbbell, 
  Users, 
  Target, 
  Award, 
  Heart,
  Star
} from 'lucide-react'
import { stats } from '../../data/mockData'

const About = () => {

  /* ========= SCROLL TO TOP ========= */
  const goToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  const values = [
    { icon: Target, title: 'Goal-Oriented', desc: 'Every workout is designed to bring you closer to your goals' },
    { icon: Heart, title: 'Member First', desc: 'Your success and satisfaction is our top priority' },
    { icon: Award, title: 'Excellence', desc: 'We strive for excellence in everything we do' },
    { icon: Users, title: 'Community', desc: 'A supportive environment where everyone belongs' }
  ]

  return (
    <div className="pt-16">

      {/* ================= HERO ================= */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-glow opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>

              {/* Our Story Badge */}
              <div className="relative inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-4 overflow-hidden group">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
                <Dumbbell size={16} className="text-primary-500 relative z-10" />
                <span className="text-primary-400 text-sm font-medium relative z-10">
                  Our Story
                </span>
              </div>

              <h1 className="section-title text-white mb-4">
                BUILDING CHAMPIONS
                <span className="text-gradient block">SINCE 2012</span>
              </h1>

              <p className="text-gray-400 text-lg mb-4 leading-relaxed">
                What started as a small fitness studio with a dream has grown into one of the most respected gym chains in the region.
              </p>

              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                Today, we continue to honor that vision by providing an inclusive, motivating environment for all fitness levels.
              </p>

              <div className="flex gap-6">
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i}>
                    <div className="font-heading text-3xl font-bold text-gradient">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"
                  alt="Santosh Gym"
                  className="w-full h-[460px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="py-16 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-4 overflow-hidden group mx-auto">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
              <Heart size={16} className="text-primary-500 relative z-10" />
              <span className="text-primary-400 text-sm font-medium relative z-10">
                Our Values
              </span>
            </div>

            <h2 className="section-title text-white">
              WHAT WE <span className="text-gradient">STAND FOR</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-3xl bg-dark-200 border border-dark-100"
              >
                <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-4">
                  <v.icon size={32} className="text-primary-500" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  {v.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-16 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="card-dark p-8">
            <Target size={28} className="text-primary-500 mb-4" />
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              Our Mission
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To provide accessible, high-quality fitness services that empower individuals to achieve their goals.
            </p>
          </div>

          <div className="card-dark p-8">
            <Star size={28} className="text-neon-orange mb-4" />
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              Our Vision
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To be the leading fitness destination that transforms lives through innovation and care.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-neon-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-400/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title text-white mb-4">
            JOIN OUR FITNESS FAMILY
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            Start your transformation journey today.
          </p>

          {/* Get Started → scrolls to TOP of Contact */}
          <Link
            to="/contact"
            onClick={goToTop}
            className="relative overflow-hidden bg-white text-dark-400 px-8 py-4 rounded-lg font-heading font-semibold uppercase tracking-wider hover:shadow-lg inline-flex items-center gap-2 group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700" />
            <span className="relative z-10">Get Started</span>
            <ArrowRight
              className="relative z-10 group-hover:translate-x-1 transition-transform"
              size={20}
            />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About
