// src/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import NewsletterModal from "../components/NewsletterModal";
import FloatingBear from "../components/FloatingBear"; // 👈 nuevo osito

export default function Layout() {
  return (
    <>
      <MobileHeader />
      <Navbar />
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
      <NewsletterModal />
      <FloatingBear /> {/* 👈 aparece en todas las páginas */}
    </>
  );
}
