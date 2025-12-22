import { axiosInstance } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  project: {},
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<any>) {
      const { project } = action.payload;

      state.project = project;
    },
  },
  extraReducers: (builder) => {},
});

export const { setProject } = projectSlice.actions;
export default projectSlice.reducer;
