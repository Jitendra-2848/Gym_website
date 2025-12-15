// src/customer/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Dumbbell,
  Users,
  Clock,
  Heart,
  Droplet,
  Coffee,
  ChevronRight,
  Star,
  Play,
  Flame,
  Trophy,
  Zap
} from 'lucide-react'
import { stats, facilities, trainers, testimonials, programs } from '../../data/mockData'

const iconMap = {
  dumbbell: Dumbbell,
  users: Users,
  clock: Clock,
  heart: Heart,
  droplet: Droplet,
  coffee: Coffee,
  flame: Flame,
  activity: Zap,
  trophy: Trophy,
  user: Users
}

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-hero-pattern"></div>
        </div>

        {/* Animated Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-neon-orange/10 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 md:py-32 text-center">
          <div className="relative mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full
  bg-primary-600/20 border border-primary-500/30 overflow-hidden group
  cursor-default">

            {/* Shine sweep */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
    bg-gradient-to-r from-transparent via-white/10 to-transparent
    transition-transform duration-700"></div>

            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>

            <span className="text-primary-300 font-medium text-sm">
              Welcome to Sanatan Gym
            </span>
          </div>

          <div className="translate-y-6">
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight">
              TRANSFORM YOUR
              <span className="block text-gradient text-shadow">BODY & MIND</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Step into a space built for champions, where every rep, every drop of sweat, and every small win takes you closer to your strongest self.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            {/* CTA buttons can go here */}
          </div>
        </div>
      </section>

      {/* About Section*/}
      <section className="py-10 md:py-14 bg-dark-400 relative overflow-hidden -mt-8">
        <div className="absolute top-0 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Images Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"
                      alt="Gym Equipment"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400"
                      alt="Training"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400"
                      alt="Weights"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400"
                      alt="Cardio"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="relative inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 
rounded-full px-4 py-2 mb-6 overflow-hidden group">

                {/* Shine sweep */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
      bg-gradient-to-r from-transparent via-white/10 to-transparent
      transition-transform duration-700"></div>

                <Dumbbell size={16} className="text-primary-500 relative z-10" />

                <span className="text-primary-400 font-medium text-sm relative z-10">
                  About Us
                </span>
              </div>


              <h2 className="section-title text-white mb-6">
                WE ARE NOT JUST A GYM, WE ARE A
                <span className="text-gradient"> LIFESTYLE</span>
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                At Sanatan Gym, we believe fitness is not just about building muscles – it's about building a better version of yourself. Our state-of-the-art facility, expert trainers, and supportive community create the perfect environment for your transformation.
              </p>

              <Link
                to="/about"
                onClick={() => window.scrollTo(0, 0)}
                className="relative btn-primary inline-flex items-center gap-2 overflow-hidden group
             hover:!translate-y-0 hover:!scale-100 active:!translate-y-0"
              >
                {/* Shine sweep */}
                <div
                  className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
    bg-gradient-to-r from-transparent via-white/10 to-transparent
    transition-transform duration-700"
                ></div>

                <span className="relative z-10">Learn More</span>

                <ArrowRight
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Link>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
