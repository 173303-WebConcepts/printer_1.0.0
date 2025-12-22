// lib/store.ts or redux/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import auth from "./slices/authSlice";
import project from "./slices/projectSlice";
import user from "./slices/userSlice";
import common from "./slices/commonSlice";

const rootReducer = combineReducers({
  auth,
  user,
  project,
  common
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "project", "user", "common"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
