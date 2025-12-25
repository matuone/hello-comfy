// src/views/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PromoBanner from "../components/PromoBanner";
import "../styles/layout.css";

export default function Layout() {
  const location = useLocation();

  const esAdmin = location.pathname.startsWith("/admin");
  const showPromoBanner = !esAdmin && location.pathname === "/";
  const isFullWidth =
    !esAdmin &&
    (location.pathname.startsWith("/create-account") ||
      location.pathname.startsWith("/products"));

  return (
    <div className="layout">
      {/* SOLO EN PÚBLICO */}
      {!esAdmin && <AnnouncementBar />}
      {!esAdmin && <Navbar />}

      <main
        className={
          esAdmin
            ? "layout__content--admin"
            : isFullWidth
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

      {!esAdmin && <Footer />}
    </div>
  );
}
