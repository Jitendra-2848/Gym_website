// src/customer/pages/About.jsx (COMPLETE)
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Dumbbell, 
  Users, 
  Target, 
  Award, 
  Heart,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { trainers, stats } from '../../data/mockData'

const About = () => {
  const values = [
    { icon: Target, title: 'Goal-Oriented', desc: 'Every workout is designed to bring you closer to your goals' },
    { icon: Heart, title: 'Member First', desc: 'Your success and satisfaction is our top priority' },
    { icon: Award, title: 'Excellence', desc: 'We strive for excellence in everything we do' },
    { icon: Users, title: 'Community', desc: 'A supportive environment where everyone belongs' }
  ]

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-glow opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-6">
                <Dumbbell size={16} className="text-primary-500" />
                <span className="text-primary-400 font-medium text-sm">Our Story</span>
              </div>

              <h1 className="section-title text-white mb-6">
                BUILDING CHAMPIONS
                <span className="text-gradient block">SINCE 2012</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                What started as a small fitness studio with a dream has grown into one of the most respected gym chains in the region. Founded by Santosh Kumar, a former national-level bodybuilder, our gym was built on the belief that everyone deserves access to world-class fitness facilities and expert guidance.
              </p>

              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Today, we continue to honor that vision by providing an inclusive, motivating environment where people of all fitness levels can achieve their goals.
              </p>

              <div className="flex flex-wrap gap-6">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-heading text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"
                  alt="Santosh Gym"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-dark-200 rounded-2xl p-6 border border-dark-100 max-w-[280px] shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100"
                      alt="Santosh Kumar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white">Santosh Kumar</h4>
                    <p className="text-primary-400 text-sm">Founder & CEO</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm italic">
                  "Fitness is not about being better than someone else. It's about being better than you used to be."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-32 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-dark p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:bg-primary-600/20 transition-colors"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center mb-6">
                  <Target className="text-primary-500" size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  To provide accessible, high-quality fitness services that empower individuals to achieve their health and wellness goals. We are committed to creating a supportive community where everyone feels welcome and motivated.
                </p>
              </div>
            </div>

            <div className="card-dark p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-orange/10 rounded-full blur-2xl group-hover:bg-neon-orange/20 transition-colors"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-neon-orange/20 flex items-center justify-center mb-6">
                  <Star className="text-neon-orange" size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-gray-400 leading-relaxed">
                  To be the leading fitness destination that transforms lives through innovative programs, cutting-edge facilities, and exceptional personal attention. We envision a healthier community, one workout at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-6">
              <Heart size={16} className="text-primary-500" />
              <span className="text-primary-400 font-medium text-sm">Our Values</span>
            </div>
            <h2 className="section-title text-white mb-4">
              WHAT WE <span className="text-gradient">STAND FOR</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-3xl bg-dark-200 border border-dark-100 hover:border-primary-600/50 transition-all duration-300 group"
              >
                <div className="w-20 h-20 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors">
                  <value.icon className="text-primary-500 group-hover:text-white transition-colors" size={36} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary-600 to-neon-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-400/50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title text-white mb-6">
            JOIN OUR FITNESS FAMILY
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            Start your transformation journey today. Our expert trainers and world-class facilities are waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-dark-400 px-8 py-4 rounded-lg font-heading font-semibold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group">
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About