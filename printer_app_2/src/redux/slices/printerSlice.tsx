// src/slices/printerSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface PrinterState {
  connected: boolean;
  address: string | null;
}

const initialState: PrinterState = {
  connected: false,
  address: null,
};

const printerSlice = createSlice({
  name: "printer",
  initialState,
  reducers: {
    setPrinterConnected(state, action) {
      state.connected = true;
      state.address = action.payload;
    },
    setPrinterDisconnected(state) {
      state.connected = false;
      state.address = null;
    },
  },
});

export const { setPrinterConnected, setPrinterDisconnected } = printerSlice.actions;
export default printerSlice.reducer;
