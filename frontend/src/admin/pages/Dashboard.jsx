// src/admin/pages/Dashboard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  ArrowRight,
  Clock
} from 'lucide-react'
import { members } from '../../data/mockData'

const Dashboard = () => {
  const activeMembers = members.filter(m => m.status === 'active').length
  const expiredMembers = members.filter(m => m.status === 'expired').length
  const totalMembers = members.length

  const stats = [
    { label: 'Total Members', value: totalMembers, icon: Users, color: 'primary' },
    { label: 'Active Members', value: activeMembers, icon: UserCheck, color: 'green' },
    { label: 'Expired', value: expiredMembers, icon: UserX, color: 'red' },
  ]

  const recentMembers = members.slice(0, 5)

  const expiringMembers = members
    .filter(m => {
      const endDate = new Date(m.endDate)
      const today = new Date()
      const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    })
    .slice(0, 5)

  const colorClasses = {
    primary: 'from-primary-600 to-neon-orange',
    green: 'from-green-600 to-green-400',
    red: 'from-red-600 to-red-400',
    blue: 'from-blue-600 to-blue-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening at your gym.</p>
        </div>
        <Link to="/admin/add" className="btn-primary flex items-center gap-2 w-fit">
          <UserPlus size={18} />
          Add New Member
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-dark p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[stat.color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

            <div className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center mb-4`}>
                <stat.icon className="text-white" size={24} />
              </div>

              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="font-heading text-3xl font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-white">Recent Members</h2>
            <Link to="/admin/list" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMembers.map((member) => (
              <Link
                key={member.id}
                to={`/admin/profile/${member.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-100 transition-colors"
              >
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{member.name}</h4>
                  <p className="text-gray-500 text-sm">{member.mobile}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}>
                  {member.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-yellow-500" size={20} />
              Expiring Soon
            </h2>
          </div>

          {expiringMembers.length > 0 ? (
            <div className="space-y-4">
              {expiringMembers.map((member) => {
                const endDate = new Date(member.endDate)
                const today = new Date()
                const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{member.name}</h4>
                      <p className="text-gray-500 text-sm">Expires: {member.endDate}</p>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium whitespace-nowrap">
                      {daysLeft} days left
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No memberships expiring soon</p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default Dashboard