"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthProvider from "./AuthProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<>Store Loading...</>} persistor={persistor}>
        <AuthProvider>
          <ToastContainer />
          {children}
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
