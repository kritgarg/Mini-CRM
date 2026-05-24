"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.js";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  CheckCircle, 
  Flame, 
  Phone, 
  Mail, 
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const { stats, isLoadingStats, fetchStats, user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, [fetchStats]);

  if (!mounted || isLoadingStats || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 h-28"></div>
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 h-80"></div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 h-80"></div>
        </div>
        {/* Recent Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 h-96"></div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 h-96"></div>
        </div>
      </div>
    );
  }

  const { kpis, leadsByCourse, leadTrends, counselorPerformance, recentLeads, followUpReminders } = stats;

  const kpiData = [
    { label: "Total Leads", value: kpis.totalLeads, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "New Leads", value: kpis.newLeads, icon: UserPlus, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Pending Follow-Ups", value: kpis.pendingFollowUps, icon: Calendar, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Converted Leads", value: kpis.convertedLeads, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Hot Leads", value: kpis.hotLeads, icon: Flame, color: "text-rose-600 bg-rose-50 border-rose-100" }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{kpi.value.toLocaleString()}</h3>
              </div>
              <div className={`p-3 rounded-lg border ${kpi.color}`}>
                <Icon className="h-5 w-5 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              Lead Trend (Past 30 Days)
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">Daily Registry</span>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(tick) => tick.slice(5)} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Created Leads" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Course Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4">
            Leads by Course demand
          </h3>
          <div className="h-52 w-full text-xs flex-1">
            {leadsByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByCourse}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadsByCourse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} leads`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No course data available
              </div>
            )}
          </div>
          {/* Legend Custom */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
            {leadsByCourse.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate" title={entry.name}>{entry.name}</span>
                <span className="font-semibold text-slate-700 ml-auto">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower grid: Recent leads, Follow up reminders, Counselor stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leads List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Student Queries</h3>
            <Link href="/leads" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
              View All Leads <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentLeads.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    {user?.role === "ADMIN" && <th>Counselor</th>}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="group">
                      <td>
                        <span className="font-bold text-slate-800 block text-xs">{lead.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-slate-600">{lead.course}</span>
                      </td>
                      <td>
                        <span className="badge badge-slate text-[10px]">{lead.stage}</span>
                      </td>
                      <td>
                        <span className={`badge text-[10px] ${
                          lead.priority === "High" ? "badge-red" : lead.priority === "Medium" ? "badge-yellow" : "badge-green"
                        }`}>
                          {lead.priority}
                        </span>
                      </td>
                      {user?.role === "ADMIN" && (
                        <td>
                          <span className="text-xs text-slate-500">{lead.counselorName}</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No recent leads found.
              </div>
            )}
          </div>
        </div>

        {/* Reminders List & Counselor Stats */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Reminders */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 shrink-0 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-amber-500" />
              Follow-up Reminders
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {followUpReminders.length > 0 ? (
                followUpReminders.map((rem) => {
                  const isOverdue = new Date(rem.nextFollowUpDate) < new Date();
                  return (
                    <div key={rem.id} className={`p-3 rounded-lg border text-left transition-colors ${
                      isOverdue 
                        ? "bg-rose-50/50 border-rose-100/70 hover:bg-rose-50" 
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                    }`}>
                      <div className="flex justify-between items-start">
                        <Link href={`/leads?id=${rem.leadId}`} className="text-xs font-bold text-slate-800 hover:text-primary-600 block">
                          {rem.leadName}
                        </Link>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isOverdue ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isOverdue ? "Overdue" : "Scheduled"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate" title={rem.comment}>
                        "{rem.comment}"
                      </p>
                      <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-400 font-semibold border-t border-slate-200/40 pt-2">
                        <span className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> {rem.leadPhone}
                        </span>
                        <span>{new Date(rem.nextFollowUpDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  All caught up! No reminders.
                </div>
              )}
            </div>
          </div>

          {/* Counselor performance (Admins see all, counselors see personal conversion status) */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card shrink-0">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-3 flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-primary-500" />
              {user?.role === "ADMIN" ? "Counselor Performance" : "My Admissions Rate"}
            </h3>
            <div className="space-y-3.5 max-h-[180px] overflow-y-auto">
              {counselorPerformance.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[150px]">{c.name}</span>
                    <span className="text-slate-500 font-semibold text-[11px]">{c.converted}/{c.leads} Converted ({c.rate}%)</span>
                  </div>
                  <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.rate > 40 ? "bg-emerald-500" : c.rate > 20 ? "bg-primary-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${c.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
