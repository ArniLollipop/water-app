// store.ts (or store.js if you're using JavaScript)
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import errorSlice from "./slices/errorSlice";

const store = configureStore({
  reducer: {
    error: errorSlice,
    user: userSlice,
  },
});

// Define the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
