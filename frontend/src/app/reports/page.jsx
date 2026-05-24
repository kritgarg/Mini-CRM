"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.js";
import { 
  BarChart3, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  Award, 
  Sparkles,
  Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from "recharts";

export default function ReportsPage() {
  const { stats, fetchStats } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, [fetchStats]);

  if (!mounted || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        <span className="text-xs font-semibold">Generating report datasets...</span>
      </div>
    );
  }

  // Generate stage mock datasets from current leads in system if available, otherwise static representation
  const stageFlowData = [
    { name: "New Leads", count: stats.kpis.totalLeads },
    { name: "Interested", count: Math.round(stats.kpis.totalLeads * 0.7) },
    { name: "Callbacks", count: Math.round(stats.kpis.totalLeads * 0.45) },
    { name: "Walk-ins", count: Math.round(stats.kpis.totalLeads * 0.25) },
    { name: "Admitted", count: stats.kpis.convertedLeads }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-card">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-primary-500" />
            CRM Reports & Conversions
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Analyze counseling productivity and admission funnels.</p>
        </div>

        <button
          onClick={() => alert("Report downloaded! (Simulation)")}
          className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors ml-auto sm:ml-0"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stage funnel card */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Admission Funnel Conversion
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students Count">
                  {stageFlowData.map((entry, index) => (
                    <area key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly progress area chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-card">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Cumulative Monthly Acquisition
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.leadTrends.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(tick) => tick.slice(8)} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={0.15} fill="#10b981" strokeWidth={2} name="Acquisitions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Conversion stats list */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-card max-w-4xl">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-amber-500" />
          Academic Admissions Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Conversion Rate</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1.5">
              {stats.kpis.totalLeads > 0 ? Math.round((stats.kpis.convertedLeads / stats.kpis.totalLeads) * 100) : 0}%
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="h-3 w-3" /> +2.4% vs last quarter
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Query Time</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1.5">2.5 Days</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">From initial inquiry to callbacks</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admitted student ratio</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1.5">
              {stats.kpis.convertedLeads} Seats
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Enrolled and verified admissions</span>
          </div>
        </div>
      </div>

    </div>
  );
}
