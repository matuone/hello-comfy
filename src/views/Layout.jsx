// src/views/Layout.jsx
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
import FloatingBear from "../components/FloatingBear"; // ← AGREGADO
import Maintenance from "./Maintenance";
import "../styles/layout.css";

export default function Layout() {
  const location = useLocation();
  const { isMaintenanceMode } = useMaintenance();
  const { user } = useAuth();

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
          showMobileNav ? (
            <PromoBannerMobile />
          ) : (
            <PromoBanner
              fullBleed
              height="clamp(520px, 72vw, 880px)"
              autoplay
              interval={5000}
            />
          )
        )}
import PromoBannerMobile from "../components/mobile/PromoBannerMobile";

        {/* ← EL OSITO VA ACÁ */}
        {!esAdmin && <FloatingBear />}

        <Outlet />
      </main>

      {/* ============================
          FOOTER (solo público)
      ============================ */}
      {!esAdmin && <Footer />}
    </div>
  );
}
