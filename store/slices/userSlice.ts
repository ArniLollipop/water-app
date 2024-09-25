import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null as IUser | null,
  },
  reducers: {
    setUser: (state, action: { payload: IUser | null }) => {
      state.user = action.payload;
      return state;
    },
    setCart: (state, action: { payload: ICart }) => {
      if (state.user) {
        state.user.cart = action.payload.cart;
        return state;
      }
    },
  },
});

export const { setUser, setCart } = userSlice.actions;

export default userSlice.reducer;
