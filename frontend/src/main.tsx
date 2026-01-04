import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./features/auth/AuthProvider";

const theme = createTheme({
  spacing: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.25rem", xl: "1.5rem" },
  radius: { sm: "10px", md: "14px", lg: "18px" },
  fontSizes: { xs: "12px", sm: "14px", md: "15px", lg: "18px", xl: "20px" },
  components: {
    Container: { defaultProps: { fluid: true, px: 0 } },
    Card: {
      defaultProps: { p: "sm", radius: "md", withBorder: true, shadow: "none" },
      styles: { root: { backgroundColor: "transparent", borderColor: "var(--mantine-color-gray-3)" } },
    },
    Stack: { defaultProps: { gap: "sm" } },
    Group: { defaultProps: { gap: "xs", wrap: "wrap" } },
    Button: { defaultProps: { radius: "xl", size: "xs" } },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);