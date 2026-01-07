import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  ArrowRight,
  Calendar,
  Hourglass,
  UserX
} from 'lucide-react'
import { Store } from '../../utils/store'

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Dashboard = () => {
  const { getAllUser, userList,priceFun } = Store();

  useEffect(() => {
    priceFun();
    getAllUser();
  }, []);

  const safeUsers = userList || [];

  // Helper: Get Days Difference
  const getDaysDiff = (dateString) => {
    if (!dateString) return -9999;
    const endDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  };

  const getProfileImage = (pic) => {
    return (pic && pic.trim() !== "") ? pic : DEFAULT_AVATAR;
  };

  // --- FILTER OUT CANCELLED USERS FOR MAIN LOGIC ---
  const ActiveUsers = safeUsers.filter(m => !m.iscancel);
  const cancelledUsers = safeUsers.filter(m => m.iscancel);

  // --- STATS CALCULATION (Excluding Cancelled) ---
  const totalCount = safeUsers.length;
  const cancelledCount = cancelledUsers.length;
  const ActiveCount = ActiveUsers.filter(m => getDaysDiff(m.end_date) >= 0).length;
  const PendingCount = ActiveUsers.filter(m => {
    const days = getDaysDiff(m.end_date);
    return days >= 0 && days <= 3;
  }).length;

  const stats = [
    { label: 'Total Members', value: totalCount, icon: Users, color: 'primary' },
    { label: 'Active Members', value: ActiveCount, icon: UserCheck, color: 'green' },
    { label: 'Pending Renewals', value: PendingCount, icon: Hourglass, color: 'orange' },
  ];

  // --- LISTS (Excluding Cancelled) ---
  const recentMembers = ActiveUsers
    .filter(m => getDaysDiff(m.end_date) >= 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const PendingList = ActiveUsers
    .filter(m => {
      const days = getDaysDiff(m.end_date);
      return days <= 3;
    })
    .sort((a, b) => getDaysDiff(a.end_date) - getDaysDiff(b.end_date))
    .slice(0, 5);

  const colorClasses = {
    primary: 'from-primary-600 to-neon-orange',
    green: 'from-green-600 to-green-400',
    orange: 'from-orange-500 to-yellow-400',
    red: 'from-red-600 to-red-400',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of SANATAN GYM AND YOGA members.</p>
        </div>
        <Link to="/admin/add" className="btn-primary flex items-center gap-2 w-fit">
          <UserPlus size={18} />
          Add New Member
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-dark p-4 md:p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[stat.color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <p className="text-gray-400 text-xs md:text-sm mb-1">{stat.label}</p>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white">{stat.value}</h3>
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
            {recentMembers.length > 0 ? recentMembers.map((member) => (
              <Link
                key={member._id}
                to={`/admin/profile/${member._id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-100 transition-colors"
              >
                <img
                  src={getProfileImage(member.profile_pic)}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover bg-dark-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{member.name}</h4>
                  <p className="text-gray-500 text-sm">Contact: {member.mobile}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Active
                </span>
              </Link>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent Active members.</p>
            )}
          </div>
        </div>

        {/* Pending Renewals */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Pending Renewals
            </h2>
            <span className="text-xs text-gray-500">(≤ 3 days)</span>
          </div>

          {PendingList.length > 0 ? (
            <div className="space-y-4">
              {PendingList.map((member) => {
                const daysLeft = getDaysDiff(member.end_date);
                
                return (
                  <Link
                    key={member._id}
                    to={`/admin/update/${member._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  >
                    <img
                      src={getProfileImage(member.profile_pic)}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover bg-dark-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{member.name}</h4>
                      <p className="text-gray-400 text-xs">Ends: {formatDate(member.end_date)}</p>
                    </div>
                    
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 whitespace-nowrap">
                        {daysLeft === 0 ? "Today" : daysLeft < 0 ? "Expired" : `${daysLeft}d`}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No Pending renewals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard