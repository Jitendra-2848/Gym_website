import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, UserPlus, Download, MoreVertical, Ban } from "lucide-react";
import { Store } from "../../utils/store";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 10;

  const { getAllUser, userList } = Store();

  useEffect(() => { getAllUser(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(endDate); end.setHours(0, 0, 0, 0);
    return Math.round((end - today) / (1000 * 60 * 60 * 24));
  };

  const getMemberStatus = (member) => {
    if (member.iscancel) return "cancelled";
    if (!member.end_date) return "pending";
    const daysLeft = getDaysLeft(member.end_date);
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "pending";
    return "active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "expired": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredMembers = userList.filter((member) => {
    const status = getMemberStatus(member);
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.mobile.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3"><Users className="text-primary-500" size={32} />All Members</h1>
          <p className="text-gray-400 mt-1">Manage all gym members</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200 text-gray-300 hover:bg-dark-100"><Download size={18} /><span className="hidden sm:inline">Export</span></button>
          <Link to="/admin/add" className="btn-primary !py-2 !px-4 flex items-center gap-2"><UserPlus size={18} /><span className="hidden sm:inline">Add</span></Link>
        </div>
      </div>

      <div className="card-dark p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="Search by name or mobile..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="input-dark pl-12 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-dark w-auto">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Member</th>
                <th className="text-left p-4 text-gray-400 font-medium">Mobile</th>
                <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left p-4 text-gray-400 font-medium">Days Left</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {paginatedMembers.map((member) => {
                const status = getMemberStatus(member);
                const daysLeft = getDaysLeft(member.end_date);

                return (
                  <tr key={member._id} className={`hover:bg-dark-300/50 transition-colors ${member.iscancel ? 'opacity-60' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={member.profile_pic || DEFAULT_AVATAR} alt={member.name} className="w-10 h-10 bg-white rounded-full object-cover" />
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {member.name}
                            {member.iscancel && <Ban size={14} className="text-gray-400" />}
                          </p>
                          <p className="text-gray-500 text-sm">{member.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{member.mobile}</td>
                    <td className="p-4">
                      {member.iscancel ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {member.duration_months ? `${member.duration_months} mo` : "—"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {member.iscancel ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d` : "Expired"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/profile/${member._id}`} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"><Eye size={16} /></Link>
                        <Link to={`/admin/update/${member._id}`} className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"><Edit size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-dark-100">
          {paginatedMembers.map((member) => {
            const status = getMemberStatus(member);
            return (
              <div key={member._id} className={`p-4 ${member.iscancel ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <img src={member.profile_pic || DEFAULT_AVATAR} alt={member.name} className="w-12 h-12 bg-white rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-medium text-sm truncate flex items-center gap-1">
                          {member.name}
                          {member.iscancel && <Ban size={12} className="text-gray-400" />}
                        </h3>
                        <p className="text-gray-400 text-xs">{member.mobile}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <div className="relative">
                          <button className="p-1.5 rounded-lg bg-dark-200 text-gray-300" onClick={() => setOpenMenuId(openMenuId === member._id ? null : member._id)}><MoreVertical size={16} /></button>
                          {openMenuId === member._id && (
                            <div className="absolute right-0 mt-2 w-28 rounded-lg bg-dark-300 border border-dark-100 shadow-xl z-20">
                              <Link to={`/admin/profile/${member._id}`} className="block px-3 py-1.5 text-xs text-blue-400 hover:bg-dark-200 rounded-t-lg" onClick={() => setOpenMenuId(null)}>View</Link>
                              <Link to={`/admin/update/${member._id}`} className="block px-3 py-1.5 text-xs text-yellow-400 hover:bg-dark-200 rounded-b-lg" onClick={() => setOpenMenuId(null)}>Edit</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No members found</h3>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-100">
            <p className="text-gray-400 text-sm">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50"><ChevronLeft size={18} /></button>
              {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg font-medium ${currentPage === i + 1 ? "bg-primary-600 text-white" : "bg-dark-200 text-gray-400"}`}>{i + 1}</button>))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;