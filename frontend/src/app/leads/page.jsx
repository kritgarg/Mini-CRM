"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.js";
import LeadDetailsDrawer from "../../components/leads/LeadDetailsDrawer.jsx";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  UserPlus2, 
  Trash2,
  Database,
  PhoneCall,
  Mail,
  RefreshCw,
  Plus,
  X
} from "lucide-react";
import api from "../../utils/api.js";
import { useSearchParams, useRouter } from "next/navigation";

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdFromUrl = searchParams.get("id");

  const { 
    leads, 
    pagination, 
    isLoadingLeads, 
    filters, 
    setFilters, 
    resetFilters, 
    fetchLeads,
    counselors,
    fetchCounselors,
    user
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  
  // Create lead modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCourse, setNewCourse] = useState("Data Science");
  const [newStage, setNewStage] = useState("New Lead");
  const [newCounselorId, setNewCounselorId] = useState("");
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [createError, setCreateError] = useState("");

  // Search input state
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchLeads();
    fetchCounselors();
  }, [fetchLeads, fetchCounselors]);

  // Open drawer if lead ID is passed in the URL (e.g. from reminders)
  useEffect(() => {
    if (leadIdFromUrl) {
      setSelectedLeadId(leadIdFromUrl);
    }
  }, [leadIdFromUrl]);

  // Handle local search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput, page: 1 });
  };

  const handleSort = (field) => {
    const isCurrent = filters.sortBy === field;
    const newOrder = isCurrent && filters.sortOrder === "desc" ? "asc" : "desc";
    setFilters({ sortBy: field, sortOrder: newOrder, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters({ page: newPage });
    }
  };

  const handleDeleteLead = async (leadId, e) => {
    e.stopPropagation(); // Avoid opening drawer
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await api.delete(`/leads/${leadId}`);
      await fetchLeads();
    } catch (err) {
      console.error("Delete lead error:", err);
      alert("Failed to delete lead. Access denied.");
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone || !newCourse) {
      setCreateError("Please fill in all required fields.");
      return;
    }

    setIsCreatingLead(true);
    setCreateError("");

    try {
      await api.post("/leads", {
        name: newName,
        email: newEmail,
        phone: newPhone,
        course: newCourse,
        stage: newStage,
        counselorId: newCounselorId === "unassigned" ? null : newCounselorId
      });

      // Clear form
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewCourse("Data Science");
      setNewStage("New Lead");
      setNewCounselorId("");
      setIsCreateModalOpen(false);

      // Refresh lead list
      await fetchLeads();
    } catch (err) {
      console.error("Create lead error:", err);
      setCreateError(err.response?.data?.error || "Failed to create lead.");
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedLeadId(null);
    // Clear URL query param if present
    if (leadIdFromUrl) {
      router.push("/leads");
    }
  };

  if (!mounted) return null;

  const COURSES = [
    "Data Science",
    "Data Analytics",
    "Full Stack Development",
    "Digital Marketing"
  ];

  const STAGES = [
    "New Lead", "Interested", "Call Back", "Follow-Up", 
    "Walk-In Scheduled", "Walk-In Missed", "Visited", 
    "Converted", "Not Interested", "Lost Lead", "Re-Engagement"
  ];

  return (
    <div className="space-y-6">
      
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-card">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-450">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or phone number..."
              className="input-premium pl-10"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchInput("");
              resetFilters();
            }}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Add Student Lead Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Grid Filters section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-card">
        {/* Stage Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ stage: e.target.value, page: 1 })}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary-500 text-slate-700"
          >
            <option value="">All Stages</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Course Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Course
          </label>
          <select
            value={filters.course}
            onChange={(e) => setFilters({ course: e.target.value, page: 1 })}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary-500 text-slate-700"
          >
            <option value="">All Courses</option>
            {COURSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value, page: 1 })}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary-500 text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Counselor Filter (Admin only) */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Counselor Assignment
          </label>
          {user?.role === "ADMIN" ? (
            <select
              value={filters.counselorId}
              onChange={(e) => setFilters({ counselorId: e.target.value, page: 1 })}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary-500 text-slate-700"
            >
              <option value="">All Counselors</option>
              <option value="unassigned">Unassigned</option>
              {counselors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 border border-slate-200/50 bg-slate-50 rounded-lg text-xs font-semibold text-slate-500 truncate">
              Scoped to: My Leads
            </div>
          )}
        </div>
      </div>

      {/* Main leads table container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoadingLeads ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
              <span className="text-xs font-semibold">Loading student database...</span>
            </div>
          ) : leads.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")} className="cursor-pointer hover:bg-slate-100">
                    <span className="flex items-center gap-1.5">Name <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th onClick={() => handleSort("course")} className="cursor-pointer hover:bg-slate-100">
                    <span className="flex items-center gap-1.5">Course <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th onClick={() => handleSort("stage")} className="cursor-pointer hover:bg-slate-100">
                    <span className="flex items-center gap-1.5">Stage <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  {user?.role === "ADMIN" && <th>Counselor</th>}
                  <th onClick={() => handleSort("priority")} className="cursor-pointer hover:bg-slate-100">
                    <span className="flex items-center gap-1.5">Priority <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="w-48">Last Contact Notes</th>
                  <th>Last Action</th>
                  {user?.role === "ADMIN" && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="cursor-pointer group"
                  >
                    <td>
                      <span className="font-bold text-slate-800 block text-xs">{lead.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{lead.email}</span>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-slate-650 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/40">{lead.course}</span>
                    </td>
                    <td>
                      <span className="badge badge-slate text-[10px]">{lead.stage}</span>
                    </td>
                    {user?.role === "ADMIN" && (
                      <td>
                        <span className="text-xs text-slate-600 font-medium">
                          {lead.counselor ? lead.counselor.name : <span className="text-slate-400">Unassigned</span>}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className={`badge text-[10px] ${
                        lead.priority === "High" ? "badge-red" : lead.priority === "Medium" ? "badge-yellow" : "badge-green"
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]" title={lead.lastFollowUpComment}>
                        {lead.lastFollowUpComment}
                      </p>
                    </td>
                    <td>
                      {lead.lastFollowUpDate ? (
                        <div>
                          <span className="text-xs text-slate-600 font-semibold block">
                            {new Date(lead.lastFollowUpDate).toLocaleDateString()}
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-wide ${
                            lead.lastFollowUpStatus === "Planned" ? "text-amber-500" : "text-emerald-500"
                          }`}>
                            {lead.lastFollowUpStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No activity</span>
                      )}
                    </td>
                    {user?.role === "ADMIN" && (
                      <td className="text-right">
                        <button
                          onClick={(e) => handleDeleteLead(lead.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-2">
              <Users className="h-8 w-8 text-slate-300" />
              <span className="text-sm font-semibold">No student records found</span>
              <p className="text-xs text-slate-400">Try modifying your filters or search keywords.</p>
            </div>
          )}
        </div>

        {/* Table footer Pagination controls */}
        {leads.length > 0 && (
          <div className="h-16 border-t border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} leads)
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Workspace Details Drawer */}
      <LeadDetailsDrawer
        leadId={selectedLeadId}
        onClose={handleCloseDrawer}
      />

      {/* Create Lead Modal Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <UserPlus2 className="h-5 w-5 text-primary-500" />
                Add Student Lead
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-premium"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-premium"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="input-premium"
                    placeholder="10-digit mobile"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Desired Course *
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none focus:border-primary-500"
                  >
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Lead Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none focus:border-primary-500"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.role === "ADMIN" && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Assign Counselor
                  </label>
                  <select
                    value={newCounselorId}
                    onChange={(e) => setNewCounselorId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none focus:border-primary-500"
                  >
                    <option value="">Unassigned</option>
                    {counselors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingLead}
                className="w-full mt-4 flex justify-center items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
              >
                {isCreatingLead ? "Creating..." : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
