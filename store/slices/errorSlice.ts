import { createSlice } from "@reduxjs/toolkit";

const errorSlice = createSlice({
  name: "error",
  initialState: {
    error: false,
    errorMessage: "Пример",
  },
  reducers: {
    setError: (
      state,
      action: {
        payload: {
          error: boolean;
          errorMessage: string;
        };
      }
    ) => {
      return action.payload;
    },
  },
});

export const { setError } = errorSlice.actions;

export default errorSlice.reducer;
