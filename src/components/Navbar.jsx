import { NavLink, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const { cart } = useShop();
  const count = cart.reduce((a, i) => a + (i.qty ?? 0), 0);

  const active = ({ isActive }) => (isActive ? { textDecoration: "underline" } : undefined);

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "12px 16px", borderBottom: "1px solid #eee", background: "#fff"
    }}>
      <Link to="/" style={{ fontWeight: 800, color: "#111", textDecoration: "none" }}>
        Hello-Comfy
      </Link>
      <nav style={{ display: "flex", gap: 12 }}>
        <NavLink to="/" style={active}>Inicio</NavLink>
        <NavLink to="/productos" style={active}>Productos</NavLink>
        <NavLink to="/nosotros" style={active}>Nosotros</NavLink>
        <NavLink to="/contacto" style={active}>Contacto</NavLink>
      </nav>
      <div>🛒 {count}</div>
    </header>
  );
}
