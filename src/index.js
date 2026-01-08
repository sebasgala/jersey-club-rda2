import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// Views - Componente de scroll
import { ScrollToTop } from "./views";

// Context
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
