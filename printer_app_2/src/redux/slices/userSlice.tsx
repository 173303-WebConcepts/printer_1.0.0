import { axiosInstance } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  loading: false,
  GAuth: null,
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      const { user } = action.payload;

      state.user = user;
    },
    setGAuth(state, action: PayloadAction<any>) {
      const GAuth = action.payload;

      state.GAuth = GAuth;
    },
  },
  extraReducers: builder => {
    // Register new user
  },
});

export const { setUser, setGAuth } = userSlice.actions;
export default userSlice.reducer;
