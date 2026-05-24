"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.js";
import api from "../../utils/api.js";
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Tag, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  Plus, 
  MessageSquare,
  Check
} from "lucide-react";

export default function LeadDetailsDrawer({ leadId, onClose }) {
  const { user, counselors, fetchCounselors, fetchLeads, fetchStats } = useStore();
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Follow-up form states
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("Planned");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isLoggingFollowUp, setIsLoggingFollowUp] = useState(false);

  // Edit lead states
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadLeadDetails();
      fetchCounselors();
    }
  }, [leadId]);

  const loadLeadDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/leads/${leadId}`);
      setLead(response.data);
      setSelectedStage(response.data.stage);
      setSelectedCounselorId(response.data.counselorId || "unassigned");
    } catch (error) {
      console.error("Load lead error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLeadAttributes = async (updatedFields) => {
    setIsUpdatingLead(true);
    try {
      const response = await api.put(`/leads/${leadId}`, updatedFields);
      setLead(prev => ({ ...prev, ...response.data.lead }));
      await fetchLeads();
      await fetchStats();
    } catch (error) {
      console.error("Update lead attributes error:", error);
    } finally {
      setIsUpdatingLead(false);
    }
  };

  const handleLogFollowUp = async (e) => {
    e.preventDefault();
    if (!comment || !nextFollowUpDate) return;

    setIsLoggingFollowUp(true);
    try {
      await api.post("/followups", {
        comment,
        status,
        nextFollowUpDate,
        leadId
      });
      setComment("");
      setNextFollowUpDate("");
      setStatus("Planned");
      
      // Reload lead details (to update priority & timeline) and refresh parent views
      await loadLeadDetails();
      await fetchLeads();
      await fetchStats();
    } catch (error) {
      console.error("Log follow-up error:", error);
    } finally {
      setIsLoggingFollowUp(false);
    }
  };

  const handleMarkFollowUpComplete = async (followUpId) => {
    try {
      await api.put(`/followups/${followUpId}`, { status: "Completed" });
      await loadLeadDetails();
      await fetchLeads();
      await fetchStats();
    } catch (error) {
      console.error("Complete follow-up error:", error);
    }
  };

  if (!leadId) return null;

  const stages = [
    "New Lead", "Interested", "Call Back", "Follow-Up", 
    "Walk-In Scheduled", "Walk-In Missed", "Visited", 
    "Converted", "Not Interested", "Lost Lead", "Re-Engagement"
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
      ></div>

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-slate-100">
        
        {/* Drawer Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Lead Workspace</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">ID: {leadId.slice(0, 8)}...</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Clock className="h-6 w-6 animate-spin text-primary-500" />
            <span className="text-xs font-semibold">Loading student record...</span>
          </div>
        ) : !lead ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Lead details could not be found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Lead Primary Info Card */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{lead.name}</h3>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Added on {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Status and priority row */}
              <div className="flex gap-2">
                <span className="badge badge-slate text-[10px] py-1 font-semibold">{lead.stage}</span>
                <span className={`badge text-[10px] py-1 font-semibold ${
                  lead.priority === "High" ? "badge-red" : lead.priority === "Medium" ? "badge-yellow" : "badge-green"
                }`}>
                  {lead.priority} Priority
                </span>
              </div>

              {/* Contact grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <a 
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{lead.phone}</span>
                </a>
                <a 
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate" title={lead.email}>{lead.email}</span>
                </a>
              </div>
            </div>

            {/* Quick Actions Form: Change Stage & Counselor */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 tracking-tight">Manage Lead Status</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Stage selector */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Lead Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => {
                      setSelectedStage(e.target.value);
                      handleUpdateLeadAttributes({ stage: e.target.value });
                    }}
                    disabled={isUpdatingLead}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-primary-500"
                  >
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                {/* Counselor selector */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Assigned Counselor
                  </label>
                  {user?.role === "ADMIN" ? (
                    <select
                      value={selectedCounselorId}
                      onChange={(e) => {
                        setSelectedCounselorId(e.target.value);
                        handleUpdateLeadAttributes({ counselorId: e.target.value });
                      }}
                      disabled={isUpdatingLead}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-primary-500"
                    >
                      <option value="unassigned">Unassigned</option>
                      {counselors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 border border-slate-200/50 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 truncate">
                      {lead.counselor ? lead.counselor.name : "Unassigned"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Log follow-up form */}
            <form onSubmit={handleLogFollowUp} className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary-500" />
                Record Follow-Up Action
              </h4>

              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs resize-none outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 bg-white text-slate-900"
                  rows={2}
                  placeholder="Record call comments, candidate status, query details..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Next Contact Date
                  </label>
                  <input
                    type="datetime-local"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none bg-white text-slate-800"
                    required
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Follow-Up Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none bg-white text-slate-800"
                  >
                    <option value="Planned">Planned (Future)</option>
                    <option value="Completed">Completed Now</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingFollowUp}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-xs"
              >
                {isLoggingFollowUp ? "Logging..." : "Save Follow-Up"}
              </button>
            </form>

            {/* Timeline history */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
                Chronological Activity history
              </h4>

              <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-5">
                {lead.followUps.length > 0 ? (
                  lead.followUps.map((fu) => {
                    const isPlanned = fu.status === "Planned";
                    return (
                      <div key={fu.id} className="relative group">
                        {/* Timeline Bullet node */}
                        <span className={`absolute -left-[22.5px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border bg-white ${
                          isPlanned 
                            ? "border-amber-400 text-amber-500" 
                            : "border-emerald-400 text-emerald-500"
                        }`}>
                          {isPlanned ? (
                            <Clock className="h-2.5 w-2.5" />
                          ) : (
                            <Check className="h-2.5 w-2.5" />
                          )}
                        </span>

                        <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                          <div className="flex justify-between items-start">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isPlanned ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {isPlanned ? "Planned Call" : "Completed Contact"}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(fu.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-2 font-medium">"{fu.comment}"</p>

                          {isPlanned && (
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/30 text-[9px] text-slate-400">
                              <span className="font-semibold flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" /> Next: {new Date(fu.nextFollowUpDate).toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMarkFollowUpComplete(fu.id)}
                                className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
                              >
                                Mark Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 text-xs py-2 pl-2">
                    No follow-ups recorded yet. Log your first contact comments above.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
