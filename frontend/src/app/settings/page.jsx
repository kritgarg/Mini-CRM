"use client";

import { useStore } from "../../store/useStore.js";
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  ShieldCheck, 
  HelpCircle,
  Mail
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-card flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">{user.name}</h2>
          <p className="text-xs text-slate-400 font-medium capitalize mt-0.5">{user.role.toLowerCase()} Account Workspace</p>
        </div>
      </div>

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation list left */}
        <div className="space-y-1.5 shrink-0">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-primary-50 text-primary-700 border border-primary-100/50 rounded-lg text-xs font-semibold transition-colors text-left">
            <User className="h-4 w-4" />
            <span>Profile settings</span>
          </button>
          <button onClick={() => alert("Setting saved (Simulation)")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-colors text-left">
            <Bell className="h-4 w-4 text-slate-400" />
            <span>Alerts & Notifications</span>
          </button>
          <button onClick={() => alert("Setting saved (Simulation)")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-colors text-left">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Security & Compliance</span>
          </button>
        </div>

        {/* Content settings pane right */}
        <div className="md:col-span-2 space-y-6">
          
          {/* User details form */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="input-premium"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Credential Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="input-premium pl-9 bg-slate-50 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications config */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">
              Notifications & Sync Settings
            </h3>
            
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-slate-350 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="font-semibold text-slate-700 block group-hover:text-slate-900">Email Daily Reminders</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">Receive morning digest of upcoming planned student follow-ups.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-slate-50">
                <input
                  type="checkbox"
                  checked={overdueAlerts}
                  onChange={(e) => setOverdueAlerts(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-slate-350 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="font-semibold text-slate-700 block group-hover:text-slate-900">High Priority Notifications</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">Show real-time dashboard notifications when active leads cross 3 days without follow-up.</span>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
