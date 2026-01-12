import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/account/accountlayout.css";

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/mi-cuenta");
  }

  return (
    <div className="account-container">

      {/* SIDEBAR */}
      <aside className="account-sidebar">

        <div style={{ textAlign: "center" }}>
          <div className="account-avatar">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
            {user?.name || "Usuario"}
          </div>

          <div style={{ fontSize: "0.9rem", color: "#777" }}>
            {user?.email}
          </div>
        </div>

        <nav className="account-nav">
          <NavLink to="/mi-cuenta/perfil">👤 Mi perfil</NavLink>
          <NavLink to="/mi-cuenta/compras">🛒 Mis compras</NavLink>
          <NavLink to="/mi-cuenta/ayuda">❓ Ayuda</NavLink>
        </nav>

        <button className="account-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="account-content">
        <Outlet />
      </main>
    </div>
  );
}
