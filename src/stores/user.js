import { defineStore } from "pinia";
import jwt_decode from "jwt-decode";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    token: localStorage.getItem("token") || null,
  }),
  getters: {
    getToken: (state) => state.token,
    getUser: (state) => jwt_decode(state.token),
    isAuthenticated: (state) => state.token !== null,
    isAdmin: (state) => {
      if (!state.token) return false
      try {
        const user = jwt_decode(state.token)
        return user.role === 'user' || user.isAdmin
      } catch {
        return false
      }
    }
  },
  actions: {
    setToken(token) {
      this.token = token;

      // Save token to local storage
      localStorage.setItem("token", this.token);
    },
    removeToken() {
      this.token = null;

      // Delete token from local storage
      localStorage.removeItem("token");
    },
  },
});
