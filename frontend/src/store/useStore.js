import { create } from "zustand";
import api from "../utils/api.js";

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("crm_user");
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("crm_token") || null;
  }
  return null;
};

export const useStore = create((set, get) => ({
  // Authentication State
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isCheckingAuth: true,

  login: (token, user) => {
    localStorage.setItem("crm_token", token);
    localStorage.setItem("crm_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isCheckingAuth: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API error:", e);
    }
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    set({ token: null, user: null, isAuthenticated: false, isCheckingAuth: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isCheckingAuth: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const response = await api.get("/auth/me");
      const user = response.data.user;
      localStorage.setItem("crm_user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      set({ token: null, user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  // Dashboard State
  stats: null,
  isLoadingStats: false,
  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const response = await api.get("/dashboard/stats");
      set({ stats: response.data, isLoadingStats: false });
    } catch (error) {
      console.error("Fetch dashboard stats failed:", error);
      set({ isLoadingStats: false });
    }
  },

  // Leads State
  leads: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  isLoadingLeads: false,
  filters: {
    search: "",
    stage: "",
    priority: "",
    course: "",
    counselorId: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc"
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchLeads();
  },

  resetFilters: () => {
    set({
      filters: {
        search: "",
        stage: "",
        priority: "",
        course: "",
        counselorId: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc"
      }
    });
    get().fetchLeads();
  },

  fetchLeads: async () => {
    set({ isLoadingLeads: true });
    try {
      const { filters } = get();
      const params = {};
      
      // Clean query params (exclude empty strings)
      Object.keys(filters).forEach(key => {
        if (filters[key] !== "") {
          params[key] = filters[key];
        }
      });

      const response = await api.get("/leads", { params });
      set({
        leads: response.data.leads,
        pagination: response.data.pagination,
        isLoadingLeads: false
      });
    } catch (error) {
      console.error("Fetch leads failed:", error);
      set({ isLoadingLeads: false });
    }
  },

  // Counselors State
  counselors: [],
  isLoadingCounselors: false,
  fetchCounselors: async () => {
    if (get().user?.role !== "ADMIN") return;
    set({ isLoadingCounselors: true });
    try {
      const response = await api.get("/users");
      set({ counselors: response.data, isLoadingCounselors: false });
    } catch (error) {
      console.error("Fetch counselors failed:", error);
      set({ isLoadingCounselors: false });
    }
  }
}));
