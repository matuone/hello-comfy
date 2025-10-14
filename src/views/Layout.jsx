import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <Outlet />
      </main>
      <footer style={{ textAlign: "center", padding: 24, opacity: 0.7 }}>
        © {new Date().getFullYear()} Hello-Comfy
      </footer>
    </>
  );
}

