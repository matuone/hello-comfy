// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRouter from "./router";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // ⭐ IMPORTANTE

import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <ShopProvider>
        <BrowserRouter>
          <AuthProvider>
            <WishlistProvider>
              <AppRouter />

              {/* ⭐ TOASTER GLOBAL */}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    fontFamily:
                      "Poppins, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    borderRadius: "10px",
                  },
                  success: {
                    style: {
                      background: "#d1fae5",
                      color: "#065f46",
                    },
                  },
                  error: {
                    style: {
                      background: "#fee2e2",
                      color: "#991b1b",
                    },
                  },
                }}
              />
              {/* ⭐ Fin Toaster */}
            </WishlistProvider>
          </AuthProvider>
        </BrowserRouter>
      </ShopProvider>
    </CartProvider>
  </React.StrictMode>
);
