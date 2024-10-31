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
          errorMessage: string | any;
        };
      }
    ) => {
      if (typeof action.payload.errorMessage == "string") return action.payload;
      else {
        return {
          error: true,
          errorMessage: action.payload.errorMessage.message,
        };
      }
    },
  },
});

export const { setError } = errorSlice.actions;

export default errorSlice.reducer;
