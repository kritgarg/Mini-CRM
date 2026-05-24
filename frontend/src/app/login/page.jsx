"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore.js";
import api from "../../utils/api.js";
import { GraduationCap, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkAuth } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("crm_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      login(token, user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failure:", err);
      setError(
        err.response?.data?.error || 
        "Failed to connect to server. Ensure backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@crm.com");
      setPassword("password123");
    } else {
      setEmail("counselor@crm.com");
      setPassword("password123");
    }
    setError("");
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-slate-50">
      {/* Left Side: Illustration / Branding Panel */}
      <div className="relative hidden md:flex md:w-1/2 bg-slate-900 justify-center items-center text-white overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-slate-950 opacity-90 z-0"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20 z-0 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10 z-0"></div>

        <div className="relative z-10 p-12 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              EduCRM
            </span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Counseling & Lead Management Platform.
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Empower your academic advisors and sales representatives. Track student inquiries from initial contact to final admission.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-900/60 border border-primary-500/20 text-xs">
                ✓
              </div>
              <p className="text-slate-300 text-sm">
                <span className="font-semibold text-white">Dynamic Workflow Pipelines:</span> Lead stages and automated priority escalation.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-900/60 border border-primary-500/20 text-xs">
                ✓
              </div>
              <p className="text-slate-300 text-sm">
                <span className="font-semibold text-white">Advanced Analytics Dashboard:</span> Conversion stats, counselor metrics, and course demands.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-900/60 border border-primary-500/20 text-xs">
                ✓
              </div>
              <p className="text-slate-300 text-sm">
                <span className="font-semibold text-white">Google Sheet Sync:</span> Seamless student registry imports in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-6 text-xs text-slate-500">
          © 2026 EduCRM Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white md:bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl md:shadow-premium border border-slate-100/50">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">EduCRM</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Please sign in to access your CRM workspace.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
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
                  placeholder="name@institute.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Password
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
              disabled={isLoading}
              className="w-full mt-2 flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick Credentials Panel for Testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick-fill accounts for demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFillCredentials("admin")}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-colors group"
              >
                <span className="text-xs font-semibold text-slate-900 group-hover:text-primary-600">Admin Account</span>
                <span className="text-[10px] text-slate-400 mt-0.5">admin@crm.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials("counselor")}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-colors group"
              >
                <span className="text-xs font-semibold text-slate-900 group-hover:text-primary-600">Counselor Account</span>
                <span className="text-[10px] text-slate-400 mt-0.5">counselor@crm.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
