"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { useStore } from "../store/useStore.js";
import Sidebar from "../components/sidebar/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth, checkAuth, user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isCheckingAuth && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [mounted, isCheckingAuth, isAuthenticated, pathname, router]);

  // Determine section title for Navbar
  const getSectionTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/leads")) return "Leads Management";
    if (pathname.startsWith("/counselors")) return "Counselor Accounts";
    if (pathname.startsWith("/reports")) return "CRM Reports & Analytics";
    if (pathname.startsWith("/settings")) return "System Settings";
    return "EduCRM Portal";
  };

  if (!mounted) {
    return (
      <html lang="en" className="h-full">
        <body className="h-full bg-slate-50"></body>
      </html>
    );
  }

  // Login page layout (no navbar/sidebar)
  if (pathname === "/login") {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    );
  }

  // Loading state during auth validation
  if (isCheckingAuth) {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="h-full flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            <p className="text-sm font-semibold text-slate-500">Checking credentials...</p>
          </div>
        </body>
      </html>
    );
  }

  // Main CRM layout
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex bg-slate-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Workspace content pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar title={getSectionTitle()} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
