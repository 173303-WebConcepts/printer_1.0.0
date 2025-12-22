import { axiosInstance } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  itemDetails: null,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setItemDetails(state, action: PayloadAction<any>) {
      const item = action.payload;

      state.itemDetails = item;
    },
  },
  extraReducers: (builder) => {
    // Register new user
  },
});

export const { setItemDetails } = commonSlice.actions;
export default commonSlice.reducer;
