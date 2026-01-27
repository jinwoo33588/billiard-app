import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "./shared/components/flatpickr.css";
import "@mantine/core/styles.css";

import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./features/auth/AuthProvider"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);