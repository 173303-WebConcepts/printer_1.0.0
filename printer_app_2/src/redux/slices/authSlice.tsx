import { axiosInstance } from "@/utils/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const registerUser = createAsyncThunk("auth/registerUser", async (formData: any, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post("/auth/register", formData);
    return data;
  } catch (error) {
    return rejectWithValue(error || "Failed to log in");
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post("/auth/login", formData);
    return data;
  } catch (error) {
    return rejectWithValue(error || "Failed to log in");
  }
});

export const userAuthCheck = createAsyncThunk("auth/userAuthCheck", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/auth/protected");
    return data;
  } catch (error) {
    return rejectWithValue(error || "Failed to log in");
  }
});

interface AuthState {
  loading: "idle" | "pending" | "succeeded" | "failed";
  userInfo: Record<string, unknown>;
  isAuthenticated: boolean;
  keys: Object;
}

const initialState: AuthState = {
  loading: "idle",
  userInfo: {},
  isAuthenticated: false,
  keys: {
    silver: 0,
    gold: 0,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser(state) {
      state.isAuthenticated = false;
      state.userInfo = {};
    },
    setUser(state, action: PayloadAction<any>) {
      const { user } = action.payload;
      if (user) {
        state.isAuthenticated = true;
        state.userInfo = { user };
      }
    },
    setKeys(state, action: PayloadAction<any>) {
      const { keys } = action.payload;


      state.keys = keys;
    },
  },
  extraReducers: (builder) => {
    // Register new user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        const { data } = action.payload;

        state.isAuthenticated = true;
        state.userInfo = data;
        if (data?.user?.role == "user") {
          state.keys = data?.user?.keys;
        }

        state.loading = "succeeded";
      })
      .addCase(registerUser.rejected, (state) => {
        state.loading = "failed";
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        const { data } = action.payload;

        state.isAuthenticated = true;
        state.userInfo = data;
        if (data?.user?.role == "user") {
          state.keys = data?.user?.keys;
        }
        state.loading = "succeeded";
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = "failed";
      });

    // User auth check
    builder
      .addCase(userAuthCheck.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(userAuthCheck.fulfilled, (state, action: PayloadAction<any>) => {
        const { data } = action.payload;

        state.isAuthenticated = true;
        state.userInfo = data;
        state.loading = "succeeded";
      })
      .addCase(userAuthCheck.rejected, (state) => {
        state.loading = "failed";
      });
  },
});

export const { logoutUser, setUser, setKeys } = authSlice.actions;
export default authSlice.reducer;
