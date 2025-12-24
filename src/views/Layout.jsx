// src/views/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PromoBanner from "../components/PromoBanner";
import "../styles/layout.css";

export default function Layout() {
  const location = useLocation();

  // Mostrar banner solo en Home
  const showPromoBanner = location.pathname === "/";

  // 🔥 FIX: rutas que necesitan ancho completo
  const isFullWidth =
    location.pathname.startsWith("/create-account") ||
    location.pathname.startsWith("/products");

  return (
    <div className="layout">
      <Navbar />

      <main
        className={
          isFullWidth
            ? "layout__content layout__content--full"
            : "layout__content"
        }
      >
        {showPromoBanner && (
          <PromoBanner
            fullBleed
            height="clamp(520px, 72vw, 880px)"
            objectPositions={["center 35%", "center top", "center 35%"]}
            autoplay
            interval={5000}
          />
        )}

        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
