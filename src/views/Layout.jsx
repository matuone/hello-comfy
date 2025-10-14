// src/views/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <>
      <Navbar />
      {/* Contenido centrado. Sin margen-top para que el banner pegue al navbar */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
