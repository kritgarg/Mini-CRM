"use client";

import { useStore } from "../store/useStore.js";
import { User, Bell, Database, RefreshCw } from "lucide-react";
import { useState } from "react";
import api from "../utils/api.js";

export default function Navbar({ title }) {
  const { user, fetchLeads, fetchStats } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleImportLeads = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const response = await api.post("/import/leads");
      setSyncMessage(response.data.message);
      
      // Refresh state
      await fetchLeads();
      await fetchStats();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSyncMessage("");
      }, 3000);
    } catch (err) {
      console.error("Import leads simulation error:", err);
      setSyncMessage("Import failed. Ensure server is active.");
      setTimeout(() => {
        setSyncMessage("");
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-10 shrink-0">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Google Sheet Sync Message */}
        {syncMessage && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 animate-fade-in">
            {syncMessage}
          </span>
        )}

        {/* Sync Google Sheets Button */}
        <button
          onClick={handleImportLeads}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Simulate Google Sheets import"
        >
          <Database className="h-3.5 w-3.5 text-slate-500" />
          <span>Import Leads</span>
          <RefreshCw className={`h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform ${
            isSyncing ? "animate-spin text-primary-500" : ""
          }`} />
        </button>

        {/* Notification Icon */}
        <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-700 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"></span>
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-100">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
