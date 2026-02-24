import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/adminabandonedcarts.css";

const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(date).toLocaleDateString("es-AR");
}

function stepLabel(step) {
  if (step === 1) return "Datos personales";
  if (step === 2) return "Envío";
  if (step === 3) return "Pago";
  if (step === 4) return "Confirmación";
  return "Carrito";
}

export default function AdminAbandonedCarts() {
  const { token } = useAuth();
  const [tab, setTab] = useState("all"); // all | registered | guest
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRecovered, setShowRecovered] = useState(false);

  // Modal de email
  const [emailModal, setEmailModal] = useState(null); // cart object
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Expandir productos
  const [expandedId, setExpandedId] = useState(null);

  // ============================
  // FETCH DATA
  // ============================
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("type", tab);
      params.set("recovered", showRecovered.toString());

      const [cartsRes, statsRes] = await Promise.all([
        fetch(`${apiPath("/abandoned-carts")}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(apiPath("/abandoned-carts/stats"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cartsData = await cartsRes.json();
      const statsData = await statsRes.json();

      setCarts(Array.isArray(cartsData) ? cartsData : []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching abandoned carts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, tab, showRecovered]);

  // ============================
  // ENVIAR EMAIL
  // ============================
  const handleSendEmail = async () => {
    if (!emailModal || !emailSubject.trim() || !emailMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(apiPath(`/abandoned-carts/${emailModal._id}/send-email`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (res.ok) {
        setEmailModal(null);
        setEmailSubject("");
        setEmailMessage("");
        fetchData(); // Refrescar
      } else {
        const data = await res.json();
        alert(data.error || "Error al enviar email");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Error al enviar email");
    } finally {
      setSending(false);
    }
  };

  // ============================
  // ELIMINAR CARRITO
  // ============================
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este carrito abandonado?")) return;

    try {
      await fetch(apiPath(`/abandoned-carts/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting cart:", err);
    }
  };

  // ============================
  // ABRIR MODAL EMAIL CON TEMPLATE
  // ============================
  const openEmailModal = (cart) => {
    setEmailModal(cart);
    setEmailSubject("¡Tu carrito te espera! 🛒 — Hello Comfy");
    setEmailMessage(
      `¡Hola${cart.name ? " " + cart.name.split(" ")[0] : ""}!\n\nVimos que dejaste algunos productos increíbles en tu carrito. ¡No te los pierdas!\n\nSi tenés alguna duda o necesitás ayuda para completar tu compra, no dudes en escribirnos.\n\n¡Te esperamos! 🧸`
    );
  };

  return (
    <div className="admin-abandoned">
      <h2 className="admin-abandoned__title">🛒 Carritos abandonados</h2>

      {/* STATS */}
      {stats && (
        <div className="admin-abandoned__stats">
          <div className="admin-abandoned__stat-card">
            <span className="stat-number">{stats.totalActive}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="admin-abandoned__stat-card admin-abandoned__stat-card--recovered">
            <span className="stat-number">{stats.totalRecovered}</span>
            <span className="stat-label">Recuperados</span>
          </div>
          <div className="admin-abandoned__stat-card">
            <span className="stat-number">{stats.registered.count}</span>
            <span className="stat-label">Clientes</span>
          </div>
          <div className="admin-abandoned__stat-card">
            <span className="stat-number">{stats.guest.count}</span>
            <span className="stat-label">Invitados</span>
          </div>
          {stats.registered.totalEstimado + stats.guest.totalEstimado > 0 && (
            <div className="admin-abandoned__stat-card admin-abandoned__stat-card--total">
              <span className="stat-number">
                ${(stats.registered.totalEstimado + stats.guest.totalEstimado).toLocaleString("es-AR")}
              </span>
              <span className="stat-label">Valor total</span>
            </div>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="admin-abandoned__tabs">
        <button
          className={`admin-abandoned__tab ${tab === "all" ? "active" : ""}`}
          onClick={() => setTab("all")}
        >
          Todos
        </button>
        <button
          className={`admin-abandoned__tab ${tab === "registered" ? "active" : ""}`}
          onClick={() => setTab("registered")}
        >
          👤 Clientes
        </button>
        <button
          className={`admin-abandoned__tab ${tab === "guest" ? "active" : ""}`}
          onClick={() => setTab("guest")}
        >
          👻 Invitados (sin cuenta)
        </button>

        <label className="admin-abandoned__toggle-recovered">
          <input
            type="checkbox"
            checked={showRecovered}
            onChange={(e) => setShowRecovered(e.target.checked)}
          />
          Mostrar recuperados
        </label>
      </div>

      {/* LOADING */}
      {loading && <p className="admin-abandoned__loading">Cargando carritos...</p>}

      {/* EMPTY */}
      {!loading && carts.length === 0 && (
        <div className="admin-abandoned__empty">
          <p>No hay carritos abandonados {tab !== "all" ? `de tipo "${tab === "registered" ? "clientes" : "invitados"}"` : ""}</p>
        </div>
      )}

      {/* LIST */}
      {!loading && carts.length > 0 && (
        <div className="admin-abandoned__list">
          {carts.map((cart) => (
            <div
              key={cart._id}
              className={`admin-abandoned__card ${cart.recovered ? "admin-abandoned__card--recovered" : ""}`}
            >
              <div className="admin-abandoned__card-header">
                <div className="admin-abandoned__card-info">
                  <span className={`admin-abandoned__type-badge admin-abandoned__type-badge--${cart.type}`}>
                    {cart.type === "registered" ? "👤 Cliente" : "👻 Invitado"}
                  </span>
                  {cart.recovered && (
                    <span className="admin-abandoned__recovered-badge">✅ Recuperado</span>
                  )}
                  <span className="admin-abandoned__step-badge">
                    Paso {cart.checkoutStep}: {stepLabel(cart.checkoutStep)}
                  </span>
                </div>
                <span className="admin-abandoned__time">{timeAgo(cart.lastActivity)}</span>
              </div>

              <div className="admin-abandoned__card-body">
                <div className="admin-abandoned__contact">
                  <p className="admin-abandoned__email">
                    📧 {cart.email}
                  </p>
                  {cart.name && <p className="admin-abandoned__name">👤 {cart.name}</p>}
                  {cart.phone && <p className="admin-abandoned__phone">📱 {cart.phone}</p>}
                </div>

                <div className="admin-abandoned__summary">
                  <span className="admin-abandoned__item-count">
                    {cart.items.length} producto{cart.items.length !== 1 ? "s" : ""}
                  </span>
                  {cart.totalEstimado > 0 && (
                    <span className="admin-abandoned__total">
                      ${cart.totalEstimado.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
              </div>

              {/* PRODUCTOS EXPANDIBLES */}
              <button
                className="admin-abandoned__toggle-items"
                onClick={() => setExpandedId(expandedId === cart._id ? null : cart._id)}
              >
                {expandedId === cart._id ? "▲ Ocultar productos" : "▼ Ver productos"}
              </button>

              {expandedId === cart._id && (
                <div className="admin-abandoned__items">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="admin-abandoned__item">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="admin-abandoned__item-img"
                        />
                      )}
                      <div className="admin-abandoned__item-info">
                        <span className="admin-abandoned__item-name">{item.name}</span>
                        <span className="admin-abandoned__item-details">
                          {item.size && `Talle: ${item.size}`}
                          {item.size && item.color && " · "}
                          {item.color && `Color: ${item.color}`}
                          {" · "}x{item.quantity}
                        </span>
                      </div>
                      <span className="admin-abandoned__item-price">
                        ${((item.price || 0) * item.quantity).toLocaleString("es-AR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* EMAILS ENVIADOS */}
              {cart.emailsSent && cart.emailsSent.length > 0 && (
                <div className="admin-abandoned__emails-sent">
                  <small>
                    📨 {cart.emailsSent.length} email{cart.emailsSent.length !== 1 ? "s" : ""} enviado{cart.emailsSent.length !== 1 ? "s" : ""}
                    {" — Último: "}
                    {timeAgo(cart.emailsSent[cart.emailsSent.length - 1].sentAt)}
                  </small>
                </div>
              )}

              {/* ACCIONES */}
              <div className="admin-abandoned__actions">
                {!cart.recovered && (
                  <button
                    className="admin-abandoned__btn-email"
                    onClick={() => openEmailModal(cart)}
                  >
                    ✉️ Enviar email
                  </button>
                )}
                <button
                  className="admin-abandoned__btn-delete"
                  onClick={() => handleDelete(cart._id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EMAIL */}
      {emailModal && (
        <div className="admin-abandoned__modal-overlay" onClick={() => setEmailModal(null)}>
          <div className="admin-abandoned__modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enviar email de recuperación</h3>
            <p className="admin-abandoned__modal-to">
              Para: <strong>{emailModal.email}</strong>
              {emailModal.name && ` (${emailModal.name})`}
            </p>

            <div className="admin-abandoned__modal-field">
              <label>Asunto</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Asunto del email..."
              />
            </div>

            <div className="admin-abandoned__modal-field">
              <label>Mensaje</label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                placeholder="Escribí el mensaje..."
              />
            </div>

            <div className="admin-abandoned__modal-preview">
              <small>El email incluirá automáticamente los productos del carrito y un botón para volver a la tienda.</small>
            </div>

            <div className="admin-abandoned__modal-actions">
              <button
                className="admin-abandoned__btn-cancel"
                onClick={() => setEmailModal(null)}
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                className="admin-abandoned__btn-send"
                onClick={handleSendEmail}
                disabled={sending || !emailSubject.trim() || !emailMessage.trim()}
              >
                {sending ? "Enviando..." : "Enviar email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
