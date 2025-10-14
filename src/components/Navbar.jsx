import { NavLink } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const { cart } = useShop();
  const count = cart.reduce((a, i) => a + (i.qty ?? 0), 0);

  return (
    <header className="navbar">
      {/* Placeholder a la izquierda para centrar el nav */}
      <div className="nav-spacer" aria-hidden="true" />

      {/* Links centrados */}
      <nav className="nav nav--center">
        <NavLink to="/" className="navlink">Inicio</NavLink>
        <NavLink to="/productos" className="navlink">Productos</NavLink>
        <NavLink to="/nosotros" className="navlink">Nosotros</NavLink>
        <NavLink to="/contacto" className="navlink">Contacto</NavLink>
        <NavLink to="/carrito" className="navlink">Carrito</NavLink>
      </nav>

      {/* Chip de carrito a la derecha (opcional) */}
      <div className="cart-chip" aria-label={`Carrito: ${count} ítems`}>
        🛒 <span>{count}</span>
      </div>
    </header>
  );
}
