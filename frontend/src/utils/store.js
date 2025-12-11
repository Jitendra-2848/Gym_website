import { create } from "zustand";
import { api } from "./axios";

export const Store = create((set, get) => ({
  checking: true,
  user: null,
  isAuthenticated: false,
  isLogging: false,
  errorMessage: null,
  memberProfile: null,
  profileLoading: false,

  checkAuth: async () => {
    set({ checking: true });
    try {
      const res = await api.get("/api/auth/check");
      const userData = res.data.user || null;    
      console.log(userData);
      if (userData) {
        set({
          user: {
            ...userData,
            role: userData.role || "member"
          },
          isAuthenticated: true,
          checking: false
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          checking: false
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        user: null,
        isAuthenticated: false,
        checking: false
      });
    }
  },

  login: async (credentials) => {
    set({ isLogging: true, errorMessage: null });

    try {
      const response = await api.post("/api/auth/login", credentials);
      const data = response.data;

      if (data.success) {
        const user = {
          role: data.role || "member",
          isFirstLogin: data.isFirstLogin || false,
          mobile: data.mobile || credentials.mobile,
          name: data.name || ""
        };

        set({
          user,
          isAuthenticated: true,
          isLogging: false,
          errorMessage: null
        });

        return { success: true, user };
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLogging: false,
          errorMessage: data.message || "Invalid credentials"
        });

        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      set({
        user: null,
        isAuthenticated: false,
        isLogging: false,
        errorMessage: errorMsg
      });
      return { success: false, message: errorMsg };
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    set({
      user: null,
      isAuthenticated: false,
      errorMessage: null,
      memberProfile: null
    });
  },

  clearError: () => set({ errorMessage: null }),

  getMemberProfile: async () => {
    set({ profileLoading: true });
    try {
      const response = await api.get("/api/member/profile");
      if (response.data?.success) {
        set({ memberProfile: response.data.data, profileLoading: false });
        return response.data.data;
      } else {
        set({ profileLoading: false });
        return null;
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      set({ profileLoading: false });
      return null;
    }
  }
}));