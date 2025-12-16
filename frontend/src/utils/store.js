import { create } from "zustand";
import { api } from "./axios";

export const Store = create((set, get) => ({
  // ================= STATE =================
  checking: true,
  user: null,
  isAuthenticated: false,
  isLogging: false,
  errorMessage: null,
  memberProfile: null,
  profileLoading: false,
  userList: [],
  userListLoading: false,
  passwordUpdating: false,
  pricing:[],
  // ================= AUTH ACTIONS =================

  checkAuth: async () => {
    set({ checking: true });
    try {
      const res = await api.get("/api/auth/check");
      const userData = res.data.user || null;

      if (userData) {
        set({
          user: {
            ...userData,
            role: userData.role || "member",
            isFirstLogin: userData.isFirstLogin ?? false,
          },
          isAuthenticated: true,
          checking: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          checking: false,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        user: null,
        isAuthenticated: false,
        checking: false,
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
          id: data.id || data._id,
          role: data.role || "member",
          isFirstLogin: data.isFirstLogin ?? false,
          mobile: data.mobile || credentials.mobile,
          name: data.name || "",
        };

        set({
          user,
          isAuthenticated: true,
          isLogging: false,
          errorMessage: null,
        });

        return { success: true, user };
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLogging: false,
          errorMessage: data.message || "Invalid credentials",
        });

        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      set({
        user: null,
        isAuthenticated: false,
        isLogging: false,
        errorMessage: errorMsg,
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
      memberProfile: null,
    });
  },

  clearError: () => set({ errorMessage: null }),

  // ================= PASSWORD RESET (FIRST LOGIN) =================

  updateCustomerCredential: async ({ currentPassword, newPassword }) => {
    set({ passwordUpdating: true, errorMessage: null });

    try {
      const response = await api.put("/api/auth/reset-password", {
        currentPassword,
        newPassword,
      });

      const data = response.data;

      if (data.success) {
        // Update user state - set isFirstLogin to false
        const currentUser = get().user;
        set({
          user: {
            ...currentUser,
            isFirstLogin: false,
          },
          passwordUpdating: false,
          errorMessage: null,
        });

        return { success: true, message: "Password updated successfully" };
      } else {
        set({
          passwordUpdating: false,
          errorMessage: data.message || "Failed to update password",
        });

        return { success: false, message: data.message || "Failed to update password" };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Server error";
      console.error("Update credential error:", error);

      set({
        passwordUpdating: false,
        errorMessage: errorMsg,
      });

      return { success: false, message: errorMsg };
    }
  },

  // ================= MEMBER PROFILE =================

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
  },

  // ================= ADMIN ACTIONS =================

  getAllUser: async () => {
    set({ userListLoading: true });
    try {
      const response = await api.get("/api/admin/all");
      if (response.data?.success) {
        set({ userList: response.data.data || [], userListLoading: false });
        return response.data.data;
      }
      set({ userListLoading: false });
      return [];
    } catch (error) {
      console.error("Get users error:", error);
      set({ userListLoading: false });
      return [];
    }
  },

  addUser: async (formData) => {
    try {
      console.log("Adding user:", formData);
      const response = await api.post("/api/admin/add", formData);

      if (response.data?.success) {
        // Refresh user list after adding
        get().getAllUser();
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data?.message || "Failed to add member" };
    } catch (error) {
      console.error("Add user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Server error",
      };
    }
  },

  updateUser: async (id, formData) => {
    try {
      console.log("Updating user:", id, formData);
      const response = await api.put(`/api/admin/update/${id}`, formData);

      if (response.data?.success) {
        get().getAllUser();
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data?.message || "Failed to update member" };
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Server error",
      };
    }
  },

  deleteUser: async (id) => {
    try {
      console.log("Deleting user:", id);
      const response = await api.delete(`/api/admin/delete/${id}`);

      if (response.data?.success) {
        get().getAllUser();
        return { success: true };
      }
      return { success: false, message: response.data?.message || "Failed to delete member" };
    } catch (error) {
      console.error("Delete user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Server error",
      };
    }
  },
  priceFun:async()=>{
    try {
      const res = await api.get("/api/admin/pricing");
      set({pricing:res.data.rate})
    } catch (error) {
      console.log("error in pricing");  
    }
  },
  cancelUserMembership: async (id) => {
    try {
      const response = await api.put(`/api/admin/cancel`, { id });
      const data = response.data;

      if (data.success) {
        // Refresh user list
        await get().getAllUser();
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to cancel" };
    } catch (error) {
      console.error("Cancel membership error:", error);
      return { success: false, message: "Network error" };
    }
  },
  updateMemberProfile: async (formData) => {
    try {
      const response = await api.put("/api/member/update", formData);

      if (response.data?.success) {
        const updatedData = response.data.data;

        // Update local state immediately
        set((state) => ({
          // Update the specific member profile data
          memberProfile: {
            ...state.memberProfile,
            ...updatedData
          },
          // Also update the main user object (so Navbar updates the name instantly)
          user: {
            ...state.user,
            name: updatedData.name,
            // If you store profilePic in user object too, update it here
          }
        }));

        return { success: true, message: "Profile updated" };
      }

      return { success: false, message: response.data?.message || "Update failed" };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Server error"
      };
    }
  },
  reset_pass: async (pass) => {
    try {
      const res = await api.put('/api/auth/set-password', { newPassword: pass })
      console.log(res.data);
    } catch (err) {
      console.log(err)
    }
  }
}));