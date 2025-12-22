import { axiosInstance } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  loading: false,
  user: {},
  userDetails: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      const { user } = action.payload;

      state.user = user;
    },
    setUserDetails(state, action: PayloadAction<any>) {
      const user = action.payload;

      state.userDetails = user;
    },
  },
  extraReducers: (builder) => {
    // Register new user
  },
});

export const { setUser, setUserDetails } = userSlice.actions;
export default userSlice.reducer;
