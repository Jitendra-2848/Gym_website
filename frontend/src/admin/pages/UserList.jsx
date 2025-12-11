// src/admin/pages/UserList.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Download,
  MoreVertical
} from 'lucide-react'
import { members } from '../../data/mockData'

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState(null)   // for mobile 3-dot menu
  const itemsPerPage = 5

  // format dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  // FIXED duration in months
  const calculateDurationMonths = (start, end) => {
    if (!start || !end) return null

    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s) || isNaN(e)) return null

    let months =
      (e.getFullYear() - s.getFullYear()) * 12 +
      (e.getMonth() - s.getMonth())

    // Correct month difference when end day < start day
    if (e.getDate() < s.getDate()) {
      months -= 1
    }

    return Math.max(months, 0) // no +1
  }

  // status logic
  const getMemberStatus = (member) => {
    if (member.status === 'cancelled') return 'cancelled'

    if (!member.endDate) return 'pending'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const end = new Date(member.endDate)
    if (isNaN(end)) return 'pending'
    end.setHours(0, 0, 0, 0)

    const diffDays = Math.round((end - today) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'delayed'
    if (diffDays <= 7) return 'pending'
    return 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'delayed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // filtering
  const filteredMembers = members.filter(member => {
    const status = getMemberStatus(member)

    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.mobile.includes(searchQuery) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || status === statusFilter

    return matchesSearch && matchesStatus
  })

  // pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-primary-500" size={32} />
            All Members
          </h1>
          <p className="text-gray-400 mt-1">Manage and view all gym members</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200 text-gray-300 hover:bg-dark-100 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link to="/admin/add" className="btn-primary !py-2 !px-4 flex items-center gap-2">
            <UserPlus size={18} />
            <span className="hidden sm:inline">Add Member</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark p-4">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, mobile, or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="input-dark pl-12 w-full"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="input-dark w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="card-dark overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Member</th>
                <th className="text-left p-4 text-gray-400 font-medium">Mobile</th>
                <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left p-4 text-gray-400 font-medium">Validity</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-100">
              {paginatedMembers.map((member) => {
                const status = getMemberStatus(member)
                const durationMonths = calculateDurationMonths(member.startDate, member.endDate)

                return (
                  <tr key={member.id} className="hover:bg-dark-300/50 transition-colors">
                    
                    {/* MEMBER */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-500 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* MOBILE */}
                    <td className="p-4 text-gray-300">{member.mobile}</td>

                    {/* DURATION */}
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                        {durationMonths !== null
                          ? `${durationMonths} month${durationMonths > 1 ? "s" : ""}`
                          : "—"}
                      </span>
                    </td>

                    {/* VALIDITY */}
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-300">{formatDate(member.startDate)}</p>
                        <p className="text-gray-500">to {formatDate(member.endDate)}</p>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/profile/${member.id}`}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          to={`/admin/update/${member.id}`}
                          className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y divide-dark-100">
          {paginatedMembers.map((member) => {
            const status = getMemberStatus(member)
            const durationMonths = calculateDurationMonths(member.startDate, member.endDate)

            return (
              <div key={member.id} className="p-4">
                <div className="flex items-start gap-4">

                  <img 
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">

                    {/* NAME + STATUS + 3 DOT MENU */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-medium truncate">{member.name}</h3>
                        <p className="text-gray-400 text-sm">{member.mobile}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>

                        {/* 3 DOT MENU */}
                        <div className="relative">
                          <button
                            className="p-2 rounded-lg bg-dark-200 text-gray-300 hover:bg-dark-100"
                            onClick={() =>
                              setOpenMenuId(openMenuId === member.id ? null : member.id)
                            }
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === member.id && (
                            <div className="absolute right-0 mt-2 w-32 rounded-lg bg-dark-300 border border-dark-100 shadow-xl z-20">
                              <Link
                                to={`/admin/profile/${member.id}`}
                                className="block px-4 py-2 text-sm text-blue-400 hover:bg-dark-200 rounded-t-lg"
                                onClick={() => setOpenMenuId(null)}
                              >
                                View
                              </Link>
                              <Link
                                to={`/admin/update/${member.id}`}
                                className="block px-4 py-2 text-sm text-yellow-400 hover:bg-dark-200"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Edit
                              </Link>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-200 rounded-b-lg"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DURATION + DATES */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                        {durationMonths !== null
                          ? `${durationMonths} month${durationMonths > 1 ? "s" : ""}`
                          : "—"}
                      </span>

                      <span className="text-gray-500 text-xs">
                        {formatDate(member.startDate)} - {formatDate(member.endDate)}
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            )
          })}
        </div>

        {/* Empty */}
        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No members found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-100">
            <p className="text-gray-400 text-sm">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-dark-100 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-dark-100 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default UserList
