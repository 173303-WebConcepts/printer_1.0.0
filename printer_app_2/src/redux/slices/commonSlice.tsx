import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  itemDetails: null,
  currentRouteName: null,
  settings: {
    localId: "",
    isKOT: true,
    isTokenNumber: true,
    dayStart: "06:00 PM",
    dayEnd: "06:00 AM",
    backupNotice: 5,
    tax: 0
  },
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setItemDetails(state, action: PayloadAction<any>) {
      const item = action.payload;

      state.itemDetails = item;
    },
    setCurrentRouteName: (state, action) => {
      state.currentRouteName = action.payload;
    },
    setSettings(state, action: PayloadAction<any>) {
      state.settings = action.payload;
    },
  },
});

export const { setItemDetails, setCurrentRouteName, setSettings } = commonSlice.actions;
export default commonSlice.reducer;
