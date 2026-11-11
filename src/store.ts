import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import componentsReducer from "./slices/componentsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    components: componentsReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
