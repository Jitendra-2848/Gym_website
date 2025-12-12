import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, 
  UserPlus, Download, MoreVertical, Ban, Trash2, AlertTriangle, X
} from "lucide-react";
import { Store } from "../../utils/store";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// --- Delete Confirmation Modal ---
const DeleteModal = ({ isOpen, onClose, onConfirm, memberName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div 
        className="bg-dark-200 rounded-2xl max-w-sm w-full p-6 border border-dark-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-500" size={32} />
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-2">
          Delete Member?
        </h3>

        <p className="text-gray-400 text-center text-sm mb-6">
          Are you sure you want to permanently delete{" "}
          <span className="text-white font-semibold break-words">"{memberName}"</span>? 
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-dark-300 text-gray-300 font-medium hover:bg-dark-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: ""
  });

  const itemsPerPage = 10;
  const { getAllUser, userList, deleteUser } = Store();

  useEffect(() => { 
    getAllUser(); 
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  // Helpers
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
    const colors = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[status] || colors.cancelled;
  };

  // --- Actions ---
  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, memberId: id, memberName: name });
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.memberId) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteModal.memberId);
      setDeleteModal({ isOpen: false, memberId: null, memberName: "" });
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Filtering & Sorting ---
  const filteredMembers = userList.filter((member) => {
    const status = getMemberStatus(member);
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || member.mobile?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Priority: Active -> Pending -> Expired -> Cancelled
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const priority = { active: 1, pending: 2, expired: 3, cancelled: 4 };
    const statusA = getMemberStatus(a);
    const statusB = getMemberStatus(b);
    
    if (priority[statusA] !== priority[statusB]) {
      return priority[statusA] - priority[statusB];
    }
    
    // Secondary sort: Days left (ascending) or created date (descending)
    if (statusA === 'active' || statusA === 'pending') {
      return (getDaysLeft(a.end_date) || 0) - (getDaysLeft(b.end_date) || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = sortedMembers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        memberName={deleteModal.memberName}
        loading={deleteLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-primary-500" size={28} />
            <span className="truncate">All Members</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage all gym members</p>
        </div>
        <div>
          <Link to="/admin/add" className="btn-primary px-4 py-2 flex items-center gap-2">
            <UserPlus size={18} /><span className="inline">Add member</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-dark p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search name or mobile..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-dark pl-12 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input-dark w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden lg:block card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Member</th>
                <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Mobile</th>
                <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Duration</th>
                <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Days Left</th>
                <th className="text-left p-4 text-gray-400 font-medium whitespace-nowrap">Status</th>
                <th className="text-center p-4 text-gray-400 font-medium whitespace-nowrap">Actions</th>
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
                        <img src={member.profile_pic || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="text-white font-medium truncate" title={member.name}>{member.name}</p>
                          <p className="text-gray-500 text-sm truncate">{member.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 whitespace-nowrap">{member.mobile}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 whitespace-nowrap">
                        {member.duration_months ? `${member.duration_months} mo` : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          daysLeft !== null && daysLeft >= 0 
                            ? daysLeft <= 7 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d` : "Expired"}
                        </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/profile/${member._id}`} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/update/${member._id}`} className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
                          <Edit size={16} />
                        </Link>
                        {member.iscancel && (
                          <button
                            onClick={() => openDeleteModal(member._id, member.name)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARD VIEW (Fixed Dropdown & Clicking) --- */}
      <div className="lg:hidden space-y-3">
        {paginatedMembers.map((member, index) => {
          const status = getMemberStatus(member);
          const daysLeft = getDaysLeft(member.end_date);
          const isLastItem = index >= paginatedMembers.length - 2; // Flip up for last 2 items
          const isOpen = openMenuId === member._id;

          return (
            <div 
              key={member._id} 
              // Removed "card-dark" if it has overflow-hidden, used explicit styles
              className={`bg-dark-200 rounded-xl p-4 border border-dark-100 ${member.iscancel ? 'opacity-70' : ''} relative`} 
              style={{ zIndex: isOpen ? 50 : 1 }} // Bring active card to front
            >
              <div className="flex items-start gap-3">
                <img 
                  src={member.profile_pic || DEFAULT_AVATAR} 
                  alt="" 
                  className="w-12 h-12 bg-dark-300 rounded-full object-cover flex-shrink-0" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-sm truncate max-w-[160px]">{member.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{member.mobile}</p>
                      
                      {!member.iscancel && daysLeft !== null && (
                        <p className={`text-xs mt-1 font-medium ${daysLeft <= 7 ? 'text-red-400' : 'text-blue-400'}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(status)}`}>
                        {status.toUpperCase()}
                      </span>

                      {/* Menu Container */}
                      <div className="relative">
                        <button
                          className="p-1.5 rounded-lg bg-dark-300 text-gray-300 hover:bg-dark-100 transition-colors"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpenMenuId(isOpen ? null : member._id); 
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                          <div 
                            className={`absolute right-0 w-36 bg-dark-300 border border-dark-100 rounded-xl shadow-2xl z-[60] overflow-hidden
                              ${isLastItem ? 'bottom-full mb-2' : 'top-full mt-2'}
                            `}
                          >
                            <Link 
                              to={`/admin/profile/${member._id}`} 
                              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-dark-200"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye size={14} /> View
                            </Link>
                            <Link 
                              to={`/admin/update/${member._id}`} 
                              className="flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-dark-200"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Edit size={14} /> Edit
                            </Link>
                            {member.iscancel && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  openDeleteModal(member._id, member.name); 
                                }}
                                className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-dark-200"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-dark-100">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50 hover:bg-dark-100"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</span>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50 hover:bg-dark-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;