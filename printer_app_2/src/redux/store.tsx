import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ React Native storage

// Import your slices
import user from "./slices/userSlice";
import printer from "./slices/printerSlice";
import common from "./slices/commonSlice";

const rootReducer = combineReducers({
  user,
  printer,
  common
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage, // ✅ Use AsyncStorage instead of localStorage
  whitelist: ["user", "printer", "common"], // only these slices will persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // ⚠️ required for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
