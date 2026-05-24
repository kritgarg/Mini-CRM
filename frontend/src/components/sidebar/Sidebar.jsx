"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../../store/useStore.js";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Contact2,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "COUNSELOR"] },
    { name: "Leads", href: "/leads", icon: Users, roles: ["ADMIN", "COUNSELOR"] },
    { name: "Counselors", href: "/counselors", icon: Contact2, roles: ["ADMIN"] },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "COUNSELOR"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "COUNSELOR"] }
  ];

  // Filter navigation items by role
  const filteredItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside 
      className={`bg-slate-900 text-slate-400 min-h-screen transition-all duration-300 flex flex-col z-20 shrink-0 border-r border-slate-800 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header Logo section */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
            <GraduationCap className="h-5 w-5 shrink-0" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-white transition-opacity duration-300">
              EduCRM
            </span>
          )}
        </Link>
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-500 hover:text-white hidden md:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-500 hover:text-white mx-auto hidden md:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/10" 
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
              }`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer User & Logout section */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        {!isCollapsed && user && (
          <div className="px-3 py-2 bg-slate-850/40 rounded-xl border border-slate-800/30 mb-3 overflow-hidden">
            <p className="text-xs font-semibold text-slate-300 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border ${
              user.role === "ADMIN" 
                ? "bg-rose-950/30 border-rose-800 text-rose-400" 
                : "bg-blue-950/30 border-blue-800 text-blue-400"
            }`}>
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-500 hover:text-rose-400" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
