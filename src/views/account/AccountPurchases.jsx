import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/account/accountpurchases.css";

const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

// ============================
// HELPERS
// ============================
function getStatusLabel(status) {
  const labels = {
    recibido: "Recibido",
    preparando: "Preparando",
    en_camino: "En camino",
    listo_retirar: "Listo para retirar",
    entregado: "Entregado",
    cancelado: "Cancelado",
    pending: "Pendiente",
    processing: "Preparando",
    shipped: "Enviado",
    delivered: "Entregado",
  };
  return labels[status?.toLowerCase()] || status || "—";
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "recibido": return "#757575";
    case "preparando":
    case "processing": return "#ff9800";
    case "en_camino":
    case "shipped": return "#2196f3";
    case "listo_retirar": return "#9c27b0";
    case "entregado":
    case "delivered": return "#4caf50";
    case "cancelado": return "#f44336";
    default: return "#9e9e9e";
  }
}

function getPagoLabel(pagoEstado) {
  const map = { pendiente: "Pago pendiente", recibido: "Pago recibido", reembolsado: "Reembolsado" };
  return map[pagoEstado] || pagoEstado || "—";
}
function getPagoColor(pagoEstado) {
  if (pagoEstado === "recibido") return "#4caf50";
  if (pagoEstado === "reembolsado") return "#f44336";
  return "#ff9800";
}

function getPaymentLabel(method) {
  const map = {
    mercadopago: "Mercado Pago",
    gocuotas: "GoCuotas (cuotas sin interés)",
    modo: "MODO",
    transfer: "Transferencia bancaria",
    cuentadni: "Cuenta DNI",
  };
  return map[method] || method || "—";
}

function getShippingLabel(method) {
  switch (method) {
    case "home": return "🏠 Envío a domicilio";
    case "pickup": return "📍 Retiro en punto de venta";
    case "correo-home": return "📬 Correo Argentino a domicilio";
    case "correo-branch": return "📬 Correo Argentino en sucursal";
    default: return method || "—";
  }
}

function getDiscountLabels(paymentMethod, discount, promoCode) {
  if (!discount || discount <= 0) return [];
  const labels = [];
  if (paymentMethod === "transfer" || paymentMethod === "cuentadni") {
    labels.push({ text: "Descuento por transferencia (10%)", type: "transfer" });
  }
  if (promoCode) {
    labels.push({ text: `Código promocional: ${promoCode}`, type: "promo" });
  }
  // Si el descuento es mayor al 10%, probablemente hay promo 3x2 también
  // (no podemos saber exactamente para órdenes viejas, pero lo indicamos genéricamente)
  if (labels.length === 0) {
    labels.push({ text: "Descuentos aplicados", type: "generic" });
  } else if (labels.length === 1 && paymentMethod === "transfer" && discount > 0) {
    // Chequeamos si el descuento es mayor al 10% del total visible → hay promo adicional
    // Este caso se da cuando hay 3x2 u otra promo además de la transferencia
    // No podemos calcular exactamente, solo avisamos si parece haber más descuentos
  }
  return labels;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Parsea strings como "2/3/2026, 13:57:00" → { day: "2 mar", time: "13:57" }
function parseTimelineDate(dateStr) {
  if (!dateStr) return { day: "", time: "" };
  const clean = dateStr.replace(",", "").trim();
  const parts = clean.split(" ");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  if (parts.length >= 2) {
    const [day, month] = (parts[0] || "").split("/");
    const monthName = months[(parseInt(month) || 1) - 1] || month;
    const timeStr = (parts[1] || "").split(":").slice(0, 2).join(":");
    return { day: `${day} ${monthName}`, time: timeStr };
  }
  return { day: dateStr, time: "" };
}

const PAYMENT_METHOD_LABELS = {
  mercadopago: "Mercado Pago",
  gocuotas: "Go Cuotas",
  modo: "MODO",
  transfer: "Transferencia bancaria",
  cuentadni: "Cuenta DNI",
};

function normalizeTimelineStatus(status, paymentMethod) {
  if (!status) return status;
  // Convertir estados en inglés
  let s = status
    .replace(/\(approved\)/gi, "(Pago aprobado)")
    .replace(/\(pending\)/gi, "(Pago pendiente)")
    .replace(/\(rejected\)/gi, "(Pago rechazado)")
    .replace(/\(cancelled\)/gi, "(Pago cancelado)")
    .replace(/\(in_process\)/gi, "(En proceso)");
  // Reemplazar el patrón viejo con el método real de la orden
  const realLabel = PAYMENT_METHOD_LABELS[paymentMethod] || null;
  if (realLabel) {
    // Reemplaza "Pago confirmado - Mercado Pago" por el estado + método real
    s = s
      .replace(/Pago confirmado - Mercado Pago \(Pago aprobado\)/gi, `Pago aprobado - ${realLabel}`)
      .replace(/Pago confirmado - Mercado Pago \(Pago pendiente\)/gi, `Pago pendiente - ${realLabel}`)
      .replace(/Pago confirmado - Mercado Pago \(Pago rechazado\)/gi, `Pago rechazado - ${realLabel}`)
      .replace(/Pago confirmado - Mercado Pago/gi, `Pago recibido - ${realLabel}`);
  } else {
    s = s.replace(/Pago confirmado - Mercado Pago/gi, "Pago recibido");
  }
  return s;
}

function getTimelineStyle(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("pago") || s.includes("cobro") || s.includes("aprobado")) return { dot: "#4caf50", icon: "$" };
  if (s.includes("enviado") || s.includes("camino") || s.includes("envío")) return { dot: "#2196f3", icon: "🚚" };
  if (s.includes("seguimiento") || s.includes("tracking") || s.includes("código")) return { dot: "#ff9800", icon: "🔎" };
  if (s.includes("entregado")) return { dot: "#4caf50", icon: "✅" };
  if (s.includes("cancelado") || s.includes("rechazado")) return { dot: "#f44336", icon: "✕" };
  if (s.includes("notificado") || s.includes("retiro")) return { dot: "#9c27b0", icon: "📬" };
  if (s.includes("recibida") || s.includes("recibido")) return { dot: "#607d8b", icon: "📋" };
  return { dot: "#9e9e9e", icon: "·" };
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
export default function AccountPurchases() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTimeline, setOpenTimeline] = useState({});
  const [lightboxImg, setLightboxImg] = useState(null);

  function toggleTimeline(orderId) {
    setOpenTimeline((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  }
  useEffect(() => {
    if (!user || !token) return;
    async function fetchOrders() {
      try {
        const res = await fetch(apiPath("/orders/my-orders"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Error al cargar las órdenes");
        } else {
          setOrders(data.orders || []);
        }
      } catch {
        setError("Error de conexión al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user, token]);

  if (loading) {
    return (
      <div className="purchases-container">
        <div className="purchases-card">
          <h1>Mis Compras</h1>
          <p className="loading">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-container">
      <div className="purchases-card">
        <h1>Mis Compras</h1>

        {error && <div className="purchases-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="purchases-empty">
            <p>No tenés órdenes aún</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              // ⭐ Calcular subtotal bruto desde items (precio original sin descuentos aplicados)
              const rawItemsTotal = (order.items || []).reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
              );
              // Descuento guardado en BD (nuevo sistema) o inferido de la diferencia (sistema viejo)
              const storedDiscount = order.totals?.discount || 0;
              const shipping = order.totals?.shipping || 0;
              const inferredDiscount = storedDiscount > 0
                ? storedDiscount
                : Math.max(0, Math.round((rawItemsTotal - (order.totals?.total || rawItemsTotal) + shipping) * 100) / 100);

              const discountLabels = getDiscountLabels(order.paymentMethod, inferredDiscount, order.promoCode);
              const trackingCode = order.shipping?.tracking || order.correoTracking || null;

              return (
                <div key={order._id} className="order-item">

                  {/* ── ENCABEZADO ── */}
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Orden #{order.code || order._id?.slice(-8).toUpperCase()}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-badges">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      {order.pagoEstado && (
                        <span
                          className="pago-badge"
                          style={{ backgroundColor: getPagoColor(order.pagoEstado) }}
                        >
                          {getPagoLabel(order.pagoEstado)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── PRODUCTOS ── */}
                  <div className="order-items">
                    <p className="section-label">PRODUCTOS:</p>
                    <div className="items-list">
                      {order.items?.length > 0 ? order.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          {item.image && (
                            <button
                              className="item-thumb-btn"
                              onClick={() => setLightboxImg(item.image)}
                              title="Ver imagen"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="item-image"
                              />
                              <span className="item-thumb-zoom">🔍</span>
                            </button>
                          )}
                          <div className="item-details">
                            <p className="item-name">{item.name || "Producto"}</p>
                            <p className="item-meta">
                              Cantidad: {item.quantity}
                              {item.size ? ` · Talle: ${item.size}` : ""}
                              {item.color ? ` · Color: ${item.color}` : ""}
                            </p>
                            <p className="item-unit-price">
                              {formatCurrency(item.price)} c/u
                            </p>
                          </div>
                          <div className="item-price">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      )) : (
                        <p className="no-items">Sin detalle de productos</p>
                      )}
                    </div>
                  </div>

                  {/* ── RESUMEN COSTOS ── */}
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal productos</span>
                      <span>{formatCurrency(rawItemsTotal)}</span>
                    </div>

                    {inferredDiscount > 0 && (
                      <div className="summary-discounts">
                        {discountLabels.map((d, i) => (
                          <div key={i} className="summary-row discount">
                            <span>{d.text}</span>
                            {i === discountLabels.length - 1 && (
                              <span style={{ color: "#4caf50", fontWeight: 600 }}>
                                -{formatCurrency(inferredDiscount)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="summary-row">
                      <span>Envío</span>
                      <span>
                        {shipping > 0
                          ? formatCurrency(shipping)
                          : <span className="free-shipping">Gratis 🎉</span>}
                      </span>
                    </div>

                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatCurrency(order.totals?.total)}</span>
                    </div>

                    <div className="summary-row payment-row">
                      <span>Medio de pago</span>
                      <span>{order.paymentMethod ? getPaymentLabel(order.paymentMethod) : "—"}</span>
                    </div>
                  </div>

                  {/* ── INFORMACIÓN DE ENVÍO ── */}
                  {order.shipping && (
                    <div className="order-shipping">
                      <p className="section-label" style={{ color: "#1565c0" }}>📦 INFORMACIÓN DE ENVÍO</p>

                      <p className="shipping-method">
                        {getShippingLabel(order.shipping.method)}
                      </p>

                      {order.shipping.address && (
                        <p className="shipping-detail">
                          <span className="shipping-detail-icon">📍</span>
                          Dirección: {order.shipping.address}
                          {order.shipping.localidad ? `, ${order.shipping.localidad}` : ""}
                          {order.shipping.province ? `, ${order.shipping.province}` : ""}
                          {order.shipping.postalCode ? ` (CP: ${order.shipping.postalCode})` : ""}
                        </p>
                      )}

                      {order.shipping.pickPoint && (
                        <p className="shipping-detail">
                          <span className="shipping-detail-icon">📍</span>
                          Punto de retiro: {order.shipping.pickPoint}
                        </p>
                      )}

                      {order.shipping.branchName && (
                        <p className="shipping-detail">
                          <span className="shipping-detail-icon">🏢</span>
                          Sucursal: {order.shipping.branchName}
                          {order.shipping.branchAddress ? ` — ${order.shipping.branchAddress}` : ""}
                        </p>
                      )}

                      {order.shipping.eta && (
                        <p className="shipping-detail">
                          <span className="shipping-detail-icon">📅</span>
                          Entrega estimada: {formatDate(order.shipping.eta)}
                        </p>
                      )}

                      {trackingCode && (
                        <div className="tracking-block">
                          <span className="tracking-label">🔎 Número de seguimiento</span>
                          <code className="tracking-code">{trackingCode}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── HISTORIAL ── */}
                  {order.timeline?.length > 0 && (
                    <div className="order-timeline">
                      <p className="timeline-heading">Historial</p>
                      <div className="timeline-list">
                        {[...order.timeline].reverse().map((entry, idx, arr) => {
                          const { dot, icon } = getTimelineStyle(entry.status);
                          const { day, time } = parseTimelineDate(entry.date);
                          return (
                            <div key={idx} className="timeline-entry">
                              <div className="timeline-left">
                                <div className="timeline-dot" style={{ background: dot }}>
                                  <span className="timeline-icon">{icon}</span>
                                </div>
                                {idx < arr.length - 1 && <div className="timeline-line" />}
                              </div>
                              <div className="timeline-content">
                                <p className="timeline-status">{normalizeTimelineStatus(entry.status, order.paymentMethod)}</p>
                                {(day || time) && (
                                  <p className="timeline-date">
                                    {day && <span>{day}</span>}
                                    {time && <span className="timeline-time">{time}</span>}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
            <img src={lightboxImg} alt="Producto" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
