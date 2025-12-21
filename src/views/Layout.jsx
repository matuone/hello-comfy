// src/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import NewsletterModal from "../components/NewsletterModal";
import FloatingBear from "../components/FloatingBear"; // 👈 nuevo osito
import "../styles/layout.css";

export default function Layout() {
  return (
    <div className="layout">
      <MobileHeader />
      <Navbar />
      <main className="layout__content">
        <Outlet />
      </main>
      <Footer />
      <NewsletterModal />
      <FloatingBear /> {/* 👈 aparece en todas las páginas */}
    </div>
  );
}
