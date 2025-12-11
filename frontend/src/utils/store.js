import { create } from "zustand"
import { api } from "./axios"

export const Store = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLogging: false,
    errorMessage: null,

    login: async (credentials) => {
        set({ isLogging: true, errorMessage: null })

        try {
            const response = await api.post("/api/auth/login", credentials)
            const data = response.data

            if (data.success === true) {
                set({
                    user: {
                        role: data.role,
                        isFirstLogin: data.isFirstLogin,
                        mobile: data.mobile || null
                    },
                    isAuthenticated: true,
                    isLogging: false,
                    errorMessage: null
                })

                return {
                    success: true,
                    role: data.role,
                    isFirstLogin: data.isFirstLogin,
                    mobile: data.mobile || null
                }
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLogging: false,
                    errorMessage: data.message || "Invalid credentials"
                })

                return { 
                    success: false, 
                    message: data.message || "Invalid credentials" 
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again."
            
            set({
                user: null,
                isAuthenticated: false,
                isLogging: false,
                errorMessage: errorMsg
            })

            return { 
                success: false, 
                message: errorMsg 
            }
        }
    },

    logout: async () => {
        try {
            await api.post("/api/auth/logout")
        } catch (error) {
            console.log("Logout error:", error)
        }

        set({
            user: null,
            isAuthenticated: false,
            errorMessage: null
        })
    },

    clearError: () => {
        set({ errorMessage: null })
    },

    memberProfile: null,
    profileLoading: false,

    getMemberProfile: async () => {
        set({ profileLoading: true })
        try {
            const response = await api.get('/api/member/profile')
            if (response.data && response.data.success) {
                set({ memberProfile: response.data.data, profileLoading: false })
                return response.data.data
            } else {
                set({ profileLoading: false })
                return null
            }
        } catch (error) {
            console.log('Profile fetch error:', error)
            set({ profileLoading: false })
            return null
        }
    }
}))