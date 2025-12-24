// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AppRouter from "./router";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext"; // 👈 IMPORTANTE

import "./styles/index.css";

import AnnouncementBar from "./components/AnnouncementBar";
import FloatingBear from "./components/FloatingBear";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ShopProvider>
      <BrowserRouter>
        <AuthProvider> {/* 👈 AHORA SÍ */}
          <AnnouncementBar
            messages={[
              "Envío gratis en compras +$190.000 🚀",
              "10% OFF X TRANSFERENCIA 💸",
              "3 cuotas sin interés 🐻",
              "Envío gratis en compras +$190.000",
            ]}
            interval={3500}
          />

          <AppRouter />

          <FloatingBear />
        </AuthProvider>
      </BrowserRouter>
    </ShopProvider>
  </React.StrictMode>
);
