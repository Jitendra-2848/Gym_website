import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Search, Eye, Edit, ChevronLeft, ChevronRight, 
  UserPlus, MoreVertical, Trash2, AlertTriangle, Clock, Calendar
} from "lucide-react";
import { Store } from "../../utils/store";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// --- DELETE MODAL ---
const DeleteModal = ({ isOpen, onClose, onConfirm, memberName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-dark-200 rounded-2xl max-w-sm w-full p-6 border border-dark-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">Delete Member?</h3>
        <p className="text-gray-400 text-center text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{memberName}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 px-4 rounded-xl bg-dark-300 text-gray-300 hover:bg-dark-100 font-medium transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors">
            {loading ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null, memberName: "" });

  const { getAllUser, userList, deleteUser } = Store();

  useEffect(() => { 
    getAllUser(); 
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  // ==================== LOGIC ====================

  const getDaysDiff = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const getCategory = (member) => {
    if (member.iscancel) return 'cancelled';
    const daysLeft = getDaysDiff(member.end_date);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 3) return 'Pending';
    return 'Active'; 
  };

  const getDurationText = (member) => {
    const startDiff = getDaysDiff(member.start_date);
    const endDiff = getDaysDiff(member.end_date);

    if (member.iscancel) return "Cancelled";
    if (endDiff < 0) return "Expired";
    if (startDiff > 0) return `Starts in ${startDiff}d`;
    if (endDiff === 0) return "Expires Today";
    return `${endDiff} Days Left`;
  };

  const getStatusColor = (category) => {
    const map = {
      Active: "bg-green-500/20 text-green-400 border-green-500/30",
      Pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return map[category] || map.cancelled;
  };

  // ==================== FILTERING & PAGINATION ====================

  const filteredMembers = userList.filter((member) => {
    const category = getCategory(member);
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.mobile?.includes(searchQuery);
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && category === statusFilter;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const priority = { Pending: 1, Active: 2, expired: 3, cancelled: 4 };
    const catA = getCategory(a);
    const catB = getCategory(b);
    
    if (priority[catA] !== priority[catB]) return priority[catA] - priority[catB];
    return getDaysDiff(a.end_date) - getDaysDiff(b.end_date);
  });

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = sortedMembers.slice(startIndex, startIndex + itemsPerPage);

  // ==================== ACTIONS ====================

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
    } catch (error) { console.error(error); } 
    finally { setDeleteLoading(false); }
  };

  const stats = {
    total: userList.length,
    Active: userList.filter(m => getCategory(m) === 'Active').length,
    Pending: userList.filter(m => getCategory(m) === 'Pending').length,
    expired: userList.filter(m => getCategory(m) === 'expired').length,
    cancelled: userList.filter(m => getCategory(m) === 'cancelled').length,
  };

  return (
    <div className="space-y-6 pb-12">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        memberName={deleteModal.memberName}
        loading={deleteLoading}
      />

      {/* Header - Responsive */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-primary-500" size={28} />
            Members
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Total: {stats.total} • Active: {stats.Active}
          </p>
        </div>
        
        {/* Button - Small on mobile (icon only), Normal on Desktop */}
        <Link to="/admin/add" className="btn-primary p-2 sm:px-4 sm:py-2 flex items-center gap-2">
          <UserPlus size={20} /> 
          <span className="hidden sm:inline">Add Member</span>
        </Link>
      </div>

      {/* Search & Filter - Stack on mobile */}
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
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-dark w-full sm:w-auto pr-10 appearance-none cursor-pointer bg-dark-200 hover:bg-dark-300 transition-colors"
            >
              <option value="all">Show All ({stats.total})</option>
              <option value="Active">Active ({stats.Active})</option>
              <option value="Pending">Pending ({stats.Pending})</option>
              <option value="expired">Expired ({stats.expired})</option>
              <option value="cancelled">Cancelled ({stats.cancelled})</option>
            </select>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block card-dark overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-300">
            <tr>
              <th className="text-left p-4 text-gray-400 font-medium">Member</th>
              <th className="text-left p-4 text-gray-400 font-medium">Mobile</th>
              <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
              <th className="text-left p-4 text-gray-400 font-medium">Time Left</th>
              <th className="text-center p-4 text-gray-400 font-medium">Category</th>
              <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {paginatedMembers.map((member) => {
              const category = getCategory(member);
              const durationText = getDurationText(member);
              
              const startDiff = getDaysDiff(member.start_date);
              const isFuture = startDiff > 0 && !member.iscancel;

              return (
                <tr 
                  key={member._id} 
                  className={`hover:bg-dark-300/50 transition-colors ${category === 'cancelled' ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={member.profile_pic || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-white font-medium truncate max-w-[180px]">{member.name}</p>
                        <p className="text-gray-500 text-xs">{member.email || "No email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{member.mobile}</td>
                  <td className="p-4">
                    <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                      {member.duration_months} Month{member.duration_months > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* Time Left - Blue Text + Icon if Future */}
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${
                      isFuture ? 'text-blue-400 font-bold' :
                      category === 'Pending' ? 'text-orange-400' :
                      category === 'expired' ? 'text-red-400' :
                      category === 'Active' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {isFuture && <Calendar size={14} className="text-blue-500" />}
                      {durationText}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(category)}`}>
                      {category.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/admin/profile/${member._id}`} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"><Eye size={16}/></Link>
                      <Link to={`/admin/update/${member._id}`} className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"><Edit size={16}/></Link>
                      {category === 'cancelled' && (
                        <button onClick={() => openDeleteModal(member._id, member.name)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><Trash2 size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-3">
        {paginatedMembers.map((member, index) => {
          const category = getCategory(member);
          const durationText = getDurationText(member);
          const isOpen = openMenuId === member._id;
          const isLastItem = index >= paginatedMembers.length - 2;

          const startDiff = getDaysDiff(member.start_date);
          const isFuture = startDiff > 0 && !member.iscancel;

          return (
            <div key={member._id} className={`bg-dark-200 rounded-xl p-4 border border-dark-100 ${category === 'cancelled' ? 'opacity-60' : ''} relative`} style={{ zIndex: isOpen ? 50 : 1 }}>
              <div className="flex items-start gap-3">
                <img src={member.profile_pic || DEFAULT_AVATAR} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-white font-bold text-sm truncate max-w-[150px]">{member.name}</h3>
                      <p className="text-gray-400 text-xs">{member.mobile}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-500/20">
                          {member.duration_months}m
                        </span>
                        
                        {/* Time Left - Blue Text + Icon if Future */}
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          isFuture ? 'text-blue-400 font-bold' :
                          category === 'Pending' ? 'text-orange-400' :
                          category === 'expired' ? 'text-red-400' : 
                          category === 'Active' ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {isFuture && <Calendar size={12} />}
                          {durationText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(category)}`}>
                        {category.toUpperCase()}
                      </span>
                      <div className="relative">
                        <button className="p-1.5 rounded-lg bg-dark-300 text-gray-300 hover:bg-dark-100 transition-colors" onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : member._id); }}>
                          <MoreVertical size={18} />
                        </button>
                        {isOpen && (
                          <div className={`absolute right-0 w-36 bg-dark-300 border border-dark-100 rounded-xl shadow-2xl z-[60] overflow-hidden ${isLastItem ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                            <Link to={`/admin/profile/${member._id}`} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-dark-200"><Eye size={14}/> View Profile</Link>
                            <Link to={`/admin/update/${member._id}`} className="flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-dark-200"><Edit size={14}/> Edit Member</Link>
                            {category === 'cancelled' && (
                              <button onClick={() => openDeleteModal(member._id, member.name)} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-dark-200"><Trash2 size={14}/> Delete</button>
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
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50 hover:bg-dark-100 transition-colors"><ChevronLeft size={20}/></button>
          <span className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-dark-200 text-gray-400 disabled:opacity-50 hover:bg-dark-100 transition-colors"><ChevronRight size={20}/></button>
        </div>
      )}
    </div>
  );
};

export default UserList;