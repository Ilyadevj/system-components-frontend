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
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.loading = false;
    },
    logoutSuccess(state) {
      state.username = "";
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
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
