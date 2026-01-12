import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/mi-cuenta");
  }

  return (
    <div style={{ display: "flex", minHeight: "70vh", maxWidth: "1200px", margin: "0 auto" }}>

      {/* ============================
          SIDEBAR
      ============================ */}
      <aside
        style={{
          width: "240px",
          padding: "24px",
          background: "#fafafa",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* Avatar + info */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#ddd",
              margin: "0 auto 12px",
              overflow: "hidden"
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>

          <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
            {user?.name || "Usuario"}
          </div>

          <div style={{ fontSize: "0.9rem", color: "#777" }}>
            {user?.email}
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink
            to="/mi-cuenta/perfil"
            style={({ isActive }) => ({
              padding: "10px 14px",
              borderRadius: "8px",
              background: isActive ? "#ffe4ec" : "transparent",
              color: isActive ? "#d94f7a" : "#444",
              fontWeight: "600",
              textDecoration: "none"
            })}
          >
            👤 Mi perfil
          </NavLink>

          <NavLink
            to="/mi-cuenta/compras"
            style={({ isActive }) => ({
              padding: "10px 14px",
              borderRadius: "8px",
              background: isActive ? "#ffe4ec" : "transparent",
              color: isActive ? "#d94f7a" : "#444",
              fontWeight: "600",
              textDecoration: "none"
            })}
          >
            🛒 Mis compras
          </NavLink>

          <NavLink
            to="/mi-cuenta/ayuda"
            style={({ isActive }) => ({
              padding: "10px 14px",
              borderRadius: "8px",
              background: isActive ? "#ffe4ec" : "transparent",
              color: isActive ? "#d94f7a" : "#444",
              fontWeight: "600",
              textDecoration: "none"
            })}
          >
            ❓ Ayuda
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#ffe4ec",
            color: "#d94f7a",
            fontWeight: "700",
            border: "none",
            cursor: "pointer"
          }}
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* ============================
          CONTENIDO
      ============================ */}
      <main style={{ flex: 1, padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
