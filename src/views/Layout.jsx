// src/views/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";

export default function Layout() {
  return (
    <>
      {/* Header exclusivo para mobile (<900px). El CSS lo oculta en desktop */}
      <MobileHeader />

      {/* Navbar original de escritorio (se oculta en mobile por CSS) */}
      <Navbar />

      {/* Contenido centrado. Sin margen-top para que el banner pegue al navbar */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
