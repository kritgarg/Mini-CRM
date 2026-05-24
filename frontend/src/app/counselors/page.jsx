"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.js";
import { 
  Contact2, 
  UserPlus, 
  X, 
  Lock, 
  Mail, 
  User, 
  Database, 
  Clock,
  ShieldAlert,
  Loader2
} from "lucide-react";
import api from "../../utils/api.js";

export default function CounselorsPage() {
  const { user, counselors, isLoadingCounselors, fetchCounselors } = useStore();
  const [mounted, setMounted] = useState(false);
  
  // Create counselor states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchCounselors();
  }, [fetchCounselors]);

  const handleCreateCounselor = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      await api.post("/users", { name, email, password });
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setIsModalOpen(false);

      // Refresh list
      await fetchCounselors();
    } catch (err) {
      console.error("Create counselor error:", err);
      setError(err.response?.data?.error || "Failed to create counselor.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted) return null;

  // Authorization Guard
  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white border border-slate-100 shadow-card rounded-2xl p-8 text-center max-w-xl mx-auto">
        <div className="bg-rose-50 p-4 rounded-full border border-rose-100 text-rose-600 mb-4 animate-bounce">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md">
          Counselor management is an Administrator privilege. Please contact system IT support if you believe you should have access to this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-card">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Contact2 className="h-4.5 w-4.5 text-primary-500" />
            Admissions Counselor Roster
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage advisor log-ins and track dynamic lead load distribution.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors ml-auto sm:ml-0"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Counselor</span>
        </button>
      </div>

      {/* Counselors list table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoadingCounselors ? (
            <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              <span className="text-xs font-semibold">Retrieving counselor data...</span>
            </div>
          ) : counselors.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Advisor Name</th>
                  <th>Email Credentials</th>
                  <th>Assigned Leads Count</th>
                  <th>User Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {counselors.map((counselor) => (
                  <tr key={counselor.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 uppercase border border-slate-200/50">
                          {counselor.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{counselor.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-500 font-medium">{counselor.email}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-55 border border-slate-200/55 rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
                        <Database className="h-3 w-3 text-slate-400" />
                        {counselor.assignedLeadsCount} Leads
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue text-[9px] font-bold uppercase tracking-wider">
                        {counselor.role}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(counselor.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-2">
              <Contact2 className="h-8 w-8 text-slate-300" />
              <span className="text-sm font-semibold">No counselors registered</span>
              <p className="text-xs text-slate-400">Click "Add Counselor" above to register advisors.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Counselor Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <UserPlus className="h-5 w-5 text-primary-500" />
                Register New Advisor
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCounselor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Advisor Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium pl-10"
                    placeholder="e.g. Alice Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium pl-10"
                    placeholder="alice@crm.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full mt-4 flex justify-center items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
