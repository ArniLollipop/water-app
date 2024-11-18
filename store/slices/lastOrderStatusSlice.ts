import { createSlice } from "@reduxjs/toolkit";

const lastOrderStatusSlice = createSlice({
  name: "lastOrderStatus",
  initialState: {
    lastOrderStatus: null as string | null,
  },
  reducers: {
    updateOrderStatus: (state, action: { payload: string | null }) => {
        state.lastOrderStatus = action.payload
    },
    clearOrderStatus: (state) => {
      state.lastOrderStatus = null;
    },
  },
});

export const { updateOrderStatus, clearOrderStatus } = lastOrderStatusSlice.actions;
export default lastOrderStatusSlice.reducer;
