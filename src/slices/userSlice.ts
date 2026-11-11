import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  username: string;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: UserState = {
  username: "",
  isAuthenticated: false,
  error: null,
  loading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ username: string }>) {
      state.username = action.payload.username;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
      localStorage.setItem("is_auth", "true");
      localStorage.setItem("username", action.payload.username);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("is_auth");
      localStorage.removeItem("username");
    },
    logoutSuccess(state) {
      state.username = "";
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("is_auth");
      localStorage.removeItem("username");
    },
    clearUserError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;
