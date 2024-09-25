import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null as IUser | null,
  },
  reducers: {
    setUser: (state, action: { payload: IUser | null }) => {
      state.user = action.payload;
    },
    setCart: (state, action: { payload: ICart }) => {
      if (state.user) {
        // Spread the current state of the user, and create a new cart object
        state.user = {
          ...state.user,
          cart: { ...action.payload.cart },
        };
      }
    },
  },
});

export const { setUser, setCart } = userSlice.actions;
export default userSlice.reducer;
