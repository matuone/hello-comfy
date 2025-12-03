// src/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import NewsletterModal from "../components/NewsletterModal";

export default function Layout() {
  return (
    <>
      {/* Header exclusivo para mobile (<900px). El CSS lo oculta en desktop */}
      <MobileHeader />

      {/* Navbar de escritorio fija estilo Apple */}
      <Navbar />

      {/* Contenido centrado con espacio para la navbar fija */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0px 16px 0 16px",
        }}
      >
        <Outlet />
      </main>

      <Footer />

      {/* Popup de newsletter global */}
      <NewsletterModal />
    </>
  );
}
