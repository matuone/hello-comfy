// src/views/Layout.jsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useMaintenance } from "../context/MaintenanceContext";
import { useAuth } from "../context/AuthContext";
import AnnouncementBar from "../components/AnnouncementBar";
import AnnouncementBarMobile from "../components/mobile/AnnouncementBarMobile";
import Navbar from "../components/Navbar";
import NavbarMobile from "../components/mobile/NavbarMobile";
import useResponsive from "../hooks/useResponsive";
import Footer from "../components/Footer";
import PromoBanner from "../components/PromoBanner";
import PromoBannerMobile from "../components/mobile/PromoBannerMobile";
import PromoBannerTablet from "../components/mobile/PromoBannerTablet"; // ← IMPORTADO
import FloatingBear from "../components/FloatingBear"; // ← AGREGADO
import WhatsAppButton from "../components/WhatsAppButton";
import Maintenance from "./Maintenance";
import "../styles/layout.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Layout() {
  const location = useLocation();
  const { isMaintenanceMode } = useMaintenance();
  const { user } = useAuth();

  // Cargar estilo badge descuento como CSS variables globales
  useEffect(() => {
    async function loadBadgeStyle() {
      try {
        const res = await fetch(`${API_URL}/config/discount-badge-style`);
        const data = await res.json();
        if (data.background) document.documentElement.style.setProperty("--badge-bg", data.background);
        if (data.color) document.documentElement.style.setProperty("--badge-color", data.color);
      } catch {
        // usar defaults de CSS
      }
    }
    loadBadgeStyle();
  }, []);

  const esAdmin = location.pathname.startsWith("/admin");
  const isAdminUser = user?.isAdmin;

  // Si está en modo mantenimiento y no es admin, mostrar página de mantenimiento
  if (isMaintenanceMode && !isAdminUser) {
    return <Maintenance />;
  }

  const showPromoBanner = !esAdmin && location.pathname === "/";
  const isFullWidth =
    !esAdmin &&
    (location.pathname === "/" ||
      location.pathname.startsWith("/create-account") ||
      location.pathname.startsWith("/products"));


  const { isMobile, isTablet } = useResponsive();
  const showMobileNav = (isMobile || isTablet) && !esAdmin;

  return (
    <div className="layout">
      {/* ============================
          HEADER STICKY (solo público)
      ============================ */}
      {!esAdmin && (
        <div className="header-sticky">
          {showMobileNav ? <AnnouncementBarMobile /> : <AnnouncementBar />}
          {showMobileNav ? <NavbarMobile /> : <Navbar />}
        </div>
      )}

      {/* ============================
          CONTENIDO PRINCIPAL
      ============================ */}
      <main
        className={
          esAdmin
            ? "layout__content--admin"
            : isFullWidth
              ? "layout__content layout__content--full"
              : "layout__content"
        }
        style={{}}
      >
        {showPromoBanner && (
          isMobile ? (
            <PromoBannerMobile />
          ) : isTablet ? (
            <PromoBannerTablet />
          ) : (
            <PromoBanner
              fullBleed
              height="clamp(520px, 72vw, 880px)"
              autoplay
              interval={5000}
            />
          )
        )}

        {/* ← EL OSITO VA ACÁ */}
        {!esAdmin && <FloatingBear />}
        {!esAdmin && <WhatsAppButton />}

        <Outlet />
      </main>

      {/* ============================
          FOOTER (solo público)
      ============================ */}
      {!esAdmin && <Footer />}
    </div>
  );
}
