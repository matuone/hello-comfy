import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef } from "react";
import defaultAvatarImg from "../../assets/avatar/avatar.png";
import "../../styles/account/accountlayout.css";

const DEFAULT_AVATAR = defaultAvatarImg;

export default function AccountLayout() {
  const { user, logout, token, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  function handleLogout() {
    logout();
    navigate("/mi-cuenta");
  }

  // ============================
  // MANEJAR CAMBIO DE AVATAR
  // ============================
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al actualizar avatar");
        setUploadingAvatar(false);
        return;
      }

      // Recargar la página para actualizar el avatar
      window.location.reload();
    } catch (err) {
      console.error("Error:", err);
      alert("Error al cargar la imagen");
      setUploadingAvatar(false);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  return (
    <div className="account-container">

      {/* SIDEBAR */}
      <aside className="account-sidebar">

        <div>
          <div className="account-avatar-wrapper">
            <div className="account-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              ) : (
                <img src={DEFAULT_AVATAR} alt="avatar" />
              )}
            </div>
            <button
              className="avatar-edit-btn"
              onClick={triggerFileInput}
              disabled={uploadingAvatar}
              title="Cambiar foto de perfil"
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="account-sidebar-name">{user?.name || "Usuario"}</div>
          <div className="account-sidebar-email">{user?.email}</div>
        </div>

        <nav className="account-nav">
          <NavLink to="/">🏠 Volver al home</NavLink>
          <NavLink to="/mi-cuenta/perfil">👤 Mi perfil</NavLink>
          <NavLink to="/mi-cuenta/compras">🛒 Mis compras</NavLink>
          <NavLink to="/mi-cuenta/opiniones">⭐ Opiniones</NavLink>
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
