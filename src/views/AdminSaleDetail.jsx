import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Centralización de rutas API
function apiPath(path) {
  const base = import.meta.env.VITE_API_URL || "/api";
  if (path.startsWith("/")) return base + path;
  return base + "/" + path;
}
import FacturaModal from "../components/FacturaModal";
import NotificationModal from "../components/NotificationModal";
import "../styles/adminsaledetail.css";
import "../styles/admin/facturamodal.css";


export default function AdminSaleDetail() {
  const { id } = useParams();
  const { adminFetch } = useAuth();

  // ============================
  // PICKUP NOTIFY MODAL
  // ============================
  const [modalPickup, setModalPickup] = useState(false);
  // Estado para errores de modal (notificaciones)
  const [modalError, setModalError] = useState(null);
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [enviandoPickup, setEnviandoPickup] = useState(false);
  const [enviandoWhatsappPickup, setEnviandoWhatsappPickup] = useState(false);
  const [fechaRetiroFecha, setFechaRetiroFecha] = useState("");
  const [fechaRetiroHora, setFechaRetiroHora] = useState("");

  function formatearFechaRetiro() {
    if (!fechaRetiroFecha || !fechaRetiroHora) return "";
    const fecha = new Date(`${fechaRetiroFecha}T${fechaRetiroHora}`);
    const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const fechaStr = fecha.toLocaleDateString("es-AR", opciones);
    const horaStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${fechaStr} a las ${horaStr}`;
  }

  async function enviarNotificacionPickup() {
    if (!fechaRetiroFecha || !fechaRetiroHora) {
      setModalError("Debes ingresar la fecha/hora para retirar.");
      return;
    }
    setEnviandoPickup(true);
    try {
      const fechaHoraFinal = formatearFechaRetiro();
      const res = await adminFetch(apiPath(`/admin/orders/${id}/pickup-notify`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fechaRetiro: fechaHoraFinal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al notificar retiro");
      setVenta(data.order);
      setModalPickup(false);
      setFechaRetiro("");
    } catch (err) {
      setModalError(err.message || "Error al notificar retiro");
    } finally {
      setEnviandoPickup(false);
    }
  }

  async function enviarWhatsappPickup(e) {
    e.preventDefault();
    const phone = (customer?.phone || customer?.whatsapp || "").replace(/[^\d]/g, "");

    if (!phone) {
      setModalError("El cliente no tiene WhatsApp cargado.");
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(getMensajeWhatsapp({
      nombre: customer.name,
      fecha: fechaRetiroFecha,
      hora: fechaRetiroHora,
      pickPoint: shipping.pickPoint,
      numeroOrden: venta.code,
    }))}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setEnviandoWhatsappPickup(true);
    try {
      const res = await adminFetch(apiPath(`/admin/orders/${id}/pickup-whatsapp-notify`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fechaRetiro: formatearFechaRetiro() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar la notificación por WhatsApp");
      setVenta(data.order);
      setModalPickup(false);
    } catch (err) {
      setModalError(err.message || "No se pudo registrar la notificación por WhatsApp");
    } finally {
      setEnviandoWhatsappPickup(false);
    }
  }

  // Utilidad para armar mensaje de WhatsApp igual al email
  function getMensajeWhatsapp({ nombre, fecha, hora, pickPoint, numeroOrden }) {
    // Formato dd/mm para la fecha de retiro
    let fechaRetiro = '';
    if (fecha && hora) {
      const fechaObj = new Date(`${fecha}T${hora}`);
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      fechaRetiro = `${dia}/${mes}`;
    }
    // Si el pickPoint es AQUELARRE, usar mensaje especial
    if (pickPoint && pickPoint.toUpperCase().includes('AQUELARRE')) {
      return `¡Buenas! Te escribo desde HELLO COMFY! para avisarte que podes pasar a retirar tu compra #${numeroOrden || ''} a partir del día ${fechaRetiro} por AQUELARRE SHOWROOM  - LAVALLE 2086 (Portón rosa), CABA\n\nLos horarios de atención del showroom son: LUN. A DOM. de 10 a 19hs, sin cita previa\n\n⚠️ Para el retiro es necesario que indiques número de pedido, nombre de quien realizó la compra emprendimiento al que corresponde la misma\n\n‼️ Los pedidos permanecen en el showroom por un plazo de 30 días, luego vuelven a nuestro taller, SIN EXCEPCIÓN\n\nSaludos,\nHELLO COMFY! 🐻`;
    }
    // Mensaje estándar
    return `¡Buenas! Te escribo desde HELLO COMFY! para avisarte que podes pasar a retirar tu compra con Orden #${numeroOrden || ''} a partir del día ${fechaRetiro} por ${pickPoint ? pickPoint + ' - ' : ''}RAFAEL JIJENA SANCHEZ 380 (Casa estilo ingles)\n\nLos horarios de atención son: LUN. A VIE. de 15 a 19hs, con cita previa\n\n� Para el retiro es necesario que indiques número de pedido y nombre de quien realizó la compra\n\nSaludos,\nHELLO COMFY!`;
  }

  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Estados para modales de facturación
  const [modalFactura, setModalFactura] = useState(null);
  const [cargandoFactura, setCargandoFactura] = useState(false);
  const [modalExito, setModalExito] = useState(null);
  const [correoLoading, setCorreoLoading] = useState(false);
  const [agencyCodeInput, setAgencyCodeInput] = useState("");
  const [correoModal, setCorreoModal] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const openCorreoModal = (title, message, type = "success") => {
    const text = title ? `${title} — ${message}` : message;
    setCorreoModal({ isOpen: true, message: text, type });
  };

  const closeCorreoModal = () => {
    setCorreoModal((prev) => ({ ...prev, isOpen: false }));
  };

  const appsRef = useRef(null);
  const moreRef = useRef(null);

  // ============================
  // CARGAR VENTA DESDE BACKEND
  // ============================
  useEffect(() => {
    async function fetchVenta() {
      try {
        const res = await adminFetch(apiPath(`/admin/orders/${id}`));

        const data = await res.json();
        setVenta(data);
      } catch (err) {
        console.error("Error cargando venta:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVenta();
  }, [id]);

  // ============================
  // FACTURAR ESTA VENTA
  // ============================
  function abrirModalFactura() {
    setModalFactura('confirmar');
  }

  async function confirmarFactura() {
    setModalFactura('tipo');
  }

  async function seleccionarTipoFactura(tipoFactura) {
    if (tipoFactura === 'A') {
      setModalFactura('cuit');
    } else {
      await generarFactura('C', null);
    }
  }

  async function confirmarCUIT(cuit) {
    if (!cuit || cuit.length < 11) {
      alert('CUIT inválido');
      return;
    }
    await generarFactura('A', cuit);
  }

  async function generarFactura(tipoFactura, cuitCliente) {
    setCargandoFactura(true);
    try {
      const body = { tipoFactura };
      if (cuitCliente) body.cuitCliente = cuitCliente;

      const res = await adminFetch(
        apiPath(`/afip/generar-factura/${id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Error al generar factura: " + (data.error || data.message || "Desconocido"));
        setModalFactura(null);
        return;
      }

      // Mostrar modal de éxito con datos de factura
      setModalExito({
        numero: data.factura?.numero || 'N/A',
        cae: data.factura?.cae || 'N/A',
        vencimiento: data.factura?.vencimientoCae || 'N/A'
      });

      // Actualizar venta en pantalla
      setVenta((prev) => {
        if (data.order) return data.order;
        if (!prev) return prev;
        return {
          ...prev,
          facturaNumero: data.factura?.numero ?? prev.facturaNumero,
          facturaCae: data.factura?.cae ?? prev.facturaCae,
          facturaVencimiento:
            data.factura?.vencimientoCae ?? prev.facturaVencimiento,
        };
      });
      setModalFactura(null);
    } catch (err) {
      console.error("Error facturando:", err);
      alert("Error al generar la factura");
      setModalFactura(null);
    } finally {
      setCargandoFactura(false);
    }
  }

  // ============================
  // DESCARGAR PDF (placeholder)
  // ============================
  async function descargarPDF() {
    try {
      if (!venta?._id) {
        alert('Orden inválida');
        return;
      }
      const url = apiPath(`/afip/factura-pdf/${venta._id}`);
      const res = await adminFetch(url, {
        method: 'GET',
      });
      if (!res.ok) throw new Error('No se pudo descargar el PDF');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const filenameMatch = disposition && /filename="?([^";]+)"?/i.exec(disposition);
      const filename = filenameMatch ? filenameMatch[1] : `Factura-${venta.facturaNumero || venta.code}.pdf`;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Error descargando PDF');
    }
  }

  // ============================
  // REGISTRAR ORDEN EN CORREO ARGENTINO (INDIVIDUAL)
  // ============================
  async function registrarOrdenCorreo() {
    if (!venta?._id) {
      openCorreoModal("Error", "Orden invalida", "error");
      return;
    }

    if (venta?.correoArgentinoTracking) {
      openCorreoModal("Info", "Esta orden ya fue registrada en Correo Argentino", "error");
      return;
    }

    setCorreoLoading(true);
    try {
      const isBranch = ["correo-branch", "branch"].includes(venta?.shipping?.method);
      const needsAgencyCode = isBranch && !venta?.shipping?.branchCode;
      if (needsAgencyCode && !agencyCodeInput.trim()) {
        openCorreoModal("Error", "Ingresá el código de sucursal antes de registrar", "error");
        setCorreoLoading(false);
        return;
      }
      const body = {};
      if (needsAgencyCode && agencyCodeInput) body.agencyCode = agencyCodeInput.trim();
      const res = await adminFetch(apiPath(`/correo-argentino/import/${venta._id}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        openCorreoModal("Error", data.error || "Error al registrar orden", "error");
        return;
      }

      setVenta((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          correoArgentinoTracking: data.extOrderId || prev.correoArgentinoTracking,
          correoArgentinoRegisteredAt: data.createdAt || prev.correoArgentinoRegisteredAt,
          timeline: [
            ...(prev.timeline || []),
            { status: "Registrado en Correo Argentino", date: new Date().toLocaleString("es-AR") },
          ],
        };
      });

      openCorreoModal("Registro exitoso", "Orden registrada en Correo Argentino", "success");
    } catch (err) {
      openCorreoModal("Error", "Error al registrar orden en Correo Argentino", "error");
    } finally {
      setCorreoLoading(false);
    }
  }

  // ============================
  // REENVIAR FACTURA (placeholder)
  // ============================
  function reenviarFactura() {
    alert("Reenviar factura todavía no está conectado al email");
  }

  // ============================
  // CERRAR DROPDOWNS AL CLIC FUERA
  // ============================
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        appsRef.current &&
        !appsRef.current.contains(e.target) &&
        moreRef.current &&
        !moreRef.current.contains(e.target)
      ) {
        setIsAppsOpen(false);
        setIsMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================
  // RENDER MÉTODO DE ENVÍO
  // ============================
  function renderMetodo(m) {
    switch (m) {
      case "home":
      case "correo-home":
        return "📦 Envío a domicilio";
      case "correo-branch":
      case "branch":
        return "🏤 Envío a sucursal (Correo Argentino)";
      case "pickup":
        return "🏬 Pick Up Point";
      default:
        return m;
    }
  }

  function copiarSeguimiento() {
    if (venta?.shipping?.tracking) {
      navigator.clipboard.writeText(venta.shipping.tracking);
      alert("Código copiado al portapapeles");
    }
  }

  function toggleApps() {
    setIsAppsOpen((prev) => !prev);
    setIsMoreOpen(false);
  }

  function toggleMore() {
    setIsMoreOpen((prev) => !prev);
    setIsAppsOpen(false);
  }

  // ============================
  // CANCELAR VENTA
  // ============================
  const [cancelando, setCancelando] = useState(false);
  const [reembolsando, setReembolsando] = useState(false);
  const [reenviandoEmailCompra, setReenviandoEmailCompra] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null });
  const [resultModal, setResultModal] = useState(null); // { tipo: "success"|"error", mensaje }

  function abrirConfirmCancelar() {
    setIsMoreOpen(false);
    setConfirmModal({ open: true, action: "cancelar" });
  }

  function abrirConfirmDevolver() {
    const metodo = venta?.paymentMethod;
    if (!["mercadopago", "gocuotas", "modo"].includes(metodo)) {
      setIsMoreOpen(false);
      setResultModal({ tipo: "error", mensaje: "Este medio de pago no soporta devolución automática. Realizá la devolución de forma manual." });
      return;
    }
    setIsMoreOpen(false);
    setConfirmModal({ open: true, action: "devolver" });
  }

  async function ejecutarAccionConfirmada() {
    const action = confirmModal.action;
    setConfirmModal({ open: false, action: null });

    if (action === "cancelar") {
      setCancelando(true);
      try {
        const res = await adminFetch(apiPath(`/admin/orders/${id}/cancel`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cancelar venta");
        setVenta(data.order);
        setResultModal({ tipo: "success", mensaje: "Venta cancelada. Se envió el email de cancelación al cliente." });
      } catch (err) {
        setResultModal({ tipo: "error", mensaje: err.message || "Error al cancelar la venta" });
      } finally {
        setCancelando(false);
      }
    }

    if (action === "devolver") {
      setReembolsando(true);
      try {
        const res = await adminFetch(apiPath(`/admin/orders/${id}/refund`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al procesar la devolución");
        setVenta(data.order);
        setResultModal({ tipo: "success", mensaje: "Devolución procesada correctamente. Se envió un email al cliente." });
      } catch (err) {
        setResultModal({ tipo: "error", mensaje: err.message || "Error al procesar la devolución" });
      } finally {
        setReembolsando(false);
      }
    }
  }

  async function reenviarEmailConfirmacionCompra() {
    setReenviandoEmailCompra(true);
    try {
      const res = await adminFetch(apiPath(`/admin/orders/${id}/resend-confirmation-email`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo reenviar el email de compra");
      setVenta(data.order);
      setResultModal({ tipo: "success", mensaje: `Email de compra reenviado a ${data.order?.customer?.email || "cliente"}.` });
    } catch (err) {
      setResultModal({ tipo: "error", mensaje: err.message || "Error reenviando email de compra" });
    } finally {
      setReenviandoEmailCompra(false);
    }
  }

  // ============================
  // ESTADO Y LÓGICA DE EDICIÓN DE COMENTARIO
  // ============================
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalEditarDireccion, setModalEditarDireccion] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);
  const [clienteForm, setClienteForm] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
  });
  const [direccionForm, setDireccionForm] = useState({
    address: "",
    localidad: "",
    province: "",
    postalCode: "",
    pickPoint: "",
    branchName: "",
    branchAddress: "",
  });

  const [isEditingComentario, setIsEditingComentario] = useState(false);
  const [comentarioEditado, setComentarioEditado] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);

  function abrirModalEditarCliente() {
    setClienteForm({
      name: venta?.customer?.name || "",
      email: venta?.customer?.email || "",
      phone: venta?.customer?.phone || venta?.customer?.whatsapp || "",
      dni: venta?.customer?.dni || "",
    });
    setModalEditarCliente(true);
  }

  function abrirModalEditarDireccion() {
    setDireccionForm({
      address: venta?.shipping?.address || "",
      localidad: venta?.shipping?.localidad || "",
      province: venta?.shipping?.province || "",
      postalCode: venta?.shipping?.postalCode || "",
      pickPoint: venta?.shipping?.pickPoint || "",
      branchName: venta?.shipping?.branchName || "",
      branchAddress: venta?.shipping?.branchAddress || "",
    });
    setModalEditarDireccion(true);
  }

  function handleClienteInputChange(e) {
    const { name, value } = e.target;
    setClienteForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDireccionInputChange(e) {
    const { name, value } = e.target;
    setDireccionForm((prev) => ({ ...prev, [name]: value }));
  }

  async function guardarCliente() {
    if (!clienteForm.email?.trim()) {
      setModalError("El email del cliente es obligatorio");
      return;
    }

    setGuardandoCliente(true);
    try {
      const res = await adminFetch(apiPath(`/admin/orders/${id}/customer`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar datos del cliente");
      setVenta(data.order);
      setModalEditarCliente(false);
    } catch (err) {
      setModalError(err.message || "Error al guardar datos del cliente");
    } finally {
      setGuardandoCliente(false);
    }
  }

  async function guardarDireccion() {
    setGuardandoDireccion(true);
    try {
      const res = await adminFetch(apiPath(`/admin/orders/${id}/address`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(direccionForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar dirección");
      setVenta(data.order);
      setModalEditarDireccion(false);
    } catch (err) {
      setModalError(err.message || "Error al guardar dirección");
    } finally {
      setGuardandoDireccion(false);
    }
  }

  async function guardarComentario() {
    setGuardandoComentario(true);
    try {
      const res = await adminFetch(apiPath(`/admin/orders/${id}/comentario`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comentario: comentarioEditado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar comentario');
      setVenta(data.order);
      setIsEditingComentario(false);
    } catch (err) {
      setModalError(err.message || 'Error al guardar comentario');
    } finally {
      setGuardandoComentario(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p>Cargando venta...</p>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="admin-section">
        <p>No se encontró la venta.</p>
      </div>
    );
  }

  const shipping = venta?.shipping || {};
  const customer = venta?.customer || {};
  const totals = venta?.totals || {};
  const items = Array.isArray(venta?.items) ? venta.items : [];
  const timeline = Array.isArray(venta?.timeline) ? venta.timeline : [];

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Orden: {venta.code}</h2>
      <p className="admin-section-text">Detalle completo de la venta.</p>

      {/* ============================
          BOTONES DE ACCIÓN
      ============================ */}

      <div className="detalle-actions">
        {/* Enviar mensaje de retiro (Pick Up) */}
        {shipping.method === "pickup" && (
          <button
            className="factura-btn"
            style={{ background: "#4caf50", color: "white" }}
            onClick={() => setModalPickup(true)}
            disabled={!!venta.pickupNotificado}
            title={venta.pickupNotificado ? "El cliente ya fue notificado" : "Enviar mensaje de retiro"}
          >
            {venta.pickupNotificado ? "✅ Cliente notificado para retiro" : "📩 Enviar mensaje de retiro"}
          </button>
        )}
        {/* ============================
          MODAL PICKUP NOTIFY
      ============================ */}
        {modalPickup && (
          <div className="factura-modal-overlay" onClick={() => setModalPickup(false)}>
            <div className="factura-modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="factura-modal-title">Notificar cliente para retiro</h2>
              <p className="factura-modal-message">¿Desde cuándo puede retirar el cliente?</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexDirection: 'column' }}>
                <label style={{ fontWeight: 500, color: '#d94f7a' }}>
                  Fecha:
                  <input
                    type="date"
                    className="factura-modal-input"
                    value={fechaRetiroFecha || ''}
                    onChange={e => setFechaRetiroFecha(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </label>
                <label style={{ fontWeight: 500, color: '#d94f7a' }}>
                  Hora:
                  <input
                    type="time"
                    className="factura-modal-input"
                    value={fechaRetiroHora || ''}
                    onChange={e => setFechaRetiroHora(e.target.value)}
                    style={{ marginTop: 4 }}
                    step="900"
                  />
                </label>
              </div>
              <div className="factura-modal-actions">
                <button
                  className="factura-modal-btn confirm"
                  onClick={enviarNotificacionPickup}
                  disabled={enviandoPickup}
                  style={{ background: "#4caf50" }}
                >
                  {enviandoPickup ? "Enviando..." : "Enviar notificación por email"}
                </button>
                {/* Botón WhatsApp — solo requiere teléfono, fecha/hora es opcional */}
                <a
                  className="factura-modal-btn confirm"
                  style={{ background: "#25d366", color: "white", textAlign: 'center', textDecoration: 'none', opacity: (customer?.phone || customer?.whatsapp) ? 1 : 0.5, pointerEvents: (customer?.phone || customer?.whatsapp) ? 'auto' : 'none' }}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={enviarWhatsappPickup}
                  title={(customer?.phone || customer?.whatsapp) ? '' : 'El cliente no tiene WhatsApp'}
                >
                  {enviandoWhatsappPickup ? "Enviando..." : "Enviar WhatsApp"}
                </a>
                <button
                  className="factura-modal-btn cancel"
                  onClick={() => setModalPickup(false)}
                  disabled={enviandoPickup || enviandoWhatsappPickup}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Facturar esta venta */}
        <button
          className={`facturar-btn ${venta.facturaNumero ? 'facturado' : 'pendiente'}`}
          onClick={abrirModalFactura}
          disabled={!!venta.facturaNumero}
        >
          {venta.facturaNumero ? '✅ Venta facturada' : '📄 Facturar esta venta'}
        </button>

        <div className="dropdown" ref={appsRef}>
          <button className="dropdown-btn" onClick={toggleApps}>
            Aplicaciones ▾
          </button>
          <div className={`dropdown-menu ${isAppsOpen ? "open" : ""}`}>
            {["correo-branch", "branch"].includes(venta?.shipping?.method) && !venta?.shipping?.branchCode && (
              <div style={{ padding: "6px 12px" }}>
                <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Código sucursal Correo:</label>
                <input
                  type="text"
                  placeholder="Ej: BA3401"
                  value={agencyCodeInput}
                  onChange={(e) => setAgencyCodeInput(e.target.value)}
                  style={{ width: "100%", padding: "4px 6px", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            )}
            <button
              onClick={registrarOrdenCorreo}
              disabled={
                correoLoading ||
                venta?.correoArgentinoTracking ||
                !["correo-home", "correo-branch", "home", "branch"].includes(venta?.shipping?.method)
              }
              title={
                !["correo-home", "correo-branch", "home", "branch"].includes(venta?.shipping?.method)
                  ? "La orden no tiene envio por Correo Argentino"
                  : venta?.correoArgentinoTracking
                    ? "Ya registrada en Correo Argentino"
                    : "Registrar orden en Correo Argentino"
              }
            >
              {correoLoading ? "Registrando..." : "Registrar orden en Correo Argentino"}
            </button>
            <button>Registrar orden en Andreani</button>
          </div>
        </div>

        <div className="dropdown" ref={moreRef}>
          <button className="dropdown-btn" onClick={toggleMore}>
            Más opciones ▾
          </button>
          <div className={`dropdown-menu ${isMoreOpen ? "open" : ""}`}>
            <button onClick={abrirConfirmCancelar} disabled={cancelando || venta?.status === "cancelado"}>
              {cancelando ? "Cancelando..." : venta?.status === "cancelado" ? "✅ Venta cancelada" : "Cancelar venta"}
            </button>
            <button onClick={abrirConfirmDevolver} disabled={reembolsando || venta?.reembolsado}>
              {reembolsando ? "Procesando..." : venta?.reembolsado ? "✅ Dinero devuelto" : "Devolver dinero"}
            </button>
          </div>
        </div>

        <button
          className="dropdown-btn"
          onClick={reenviarEmailConfirmacionCompra}
          disabled={reenviandoEmailCompra || !customer?.email}
          title={!customer?.email ? "La orden no tiene email cargado" : "Reenviar email automático de compra"}
        >
          {reenviandoEmailCompra ? "Reenviando email..." : "Reenviar email de compra"}
        </button>

      </div>

      {/* ============================
          GRID PRINCIPAL
      ============================ */}
      <div className="detalle-grid">

        {/* PRODUCTOS */}
        <div className="detalle-box">
          <h3 className="detalle-title">Productos</h3>

          {items.length ? items.map((item, i) => (
            <div key={i} className="detalle-info-line">
              <strong>{item.name}</strong> — {item.quantity} unid.
              {item.size && <span style={{ color: '#e91e8c', fontWeight: 600 }}> — Talle: {item.size}</span>}
              {item.color && ` — Color: ${item.color}`}
              {" — "}${item.price?.toLocaleString("es-AR")}
            </div>
          )) : <p className="detalle-info-line">No hay productos en la venta.</p>}

          <div className="detalle-totales">
            {totals.subtotal > 0 && (
              <p className="detalle-info-line">
                <span>Subtotal</span>
                <span>${totals.subtotal.toLocaleString("es-AR")}</span>
              </p>
            )}
            {totals.promo3x2Discount > 0 && (
              <p className="detalle-info-line detalle-descuento">
                <span>Descuento 3x2</span>
                <span>-${totals.promo3x2Discount.toLocaleString("es-AR")}</span>
              </p>
            )}
            {totals.promoDiscount > 0 && (
              <p className="detalle-info-line detalle-descuento">
                <span>Cupón{venta?.promoCode ? ` (${venta.promoCode})` : ""}</span>
                <span>-${totals.promoDiscount.toLocaleString("es-AR")}</span>
              </p>
            )}
            {totals.transferDiscount > 0 && (
              <p className="detalle-info-line detalle-descuento">
                <span>Desc. transferencia (10%)</span>
                <span>-${totals.transferDiscount.toLocaleString("es-AR")}</span>
              </p>
            )}
            <p className="detalle-info-line">
              <span>Envío</span>
              <span>{totals.shipping > 0 ? `$${totals.shipping.toLocaleString("es-AR")}` : "Gratis"}</span>
            </p>
            <p className="detalle-info-line detalle-total">
              <strong>Total pagado</strong>
              <strong>${(totals.total || 0).toLocaleString("es-AR")}</strong>
            </p>
          </div>
        </div>

        {/* CLIENTE */}
        <div className="detalle-box">
          <div className="detalle-header-row">
            <h3 className="detalle-title">Cliente</h3>
            <button className="detalle-edit-btn" onClick={abrirModalEditarCliente}>
              Editar
            </button>
          </div>
          <p className="detalle-info-line"><strong>Nombre:</strong> {customer.name}</p>
          {customer.dni && (
            <p className="detalle-info-line"><strong>DNI:</strong> {customer.dni}</p>
          )}
          <p className="detalle-info-line"><strong>Email:</strong> {customer.email}</p>
          {(customer.phone || customer.whatsapp) && (
            <p className="detalle-info-line">
              <strong>WhatsApp:</strong>{" "}
              <a
                href={`https://wa.me/${(customer.phone || customer.whatsapp).replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25d366', fontWeight: 600, textDecoration: 'none' }}
              >
                {customer.phone || customer.whatsapp}
              </a>
            </p>
          )}
        </div>

        {/* DIRECCIÓN */}
        {(shipping.method === "home" || shipping.method === "correo-home") && (
          <div className="detalle-box">
            <div className="detalle-header-row">
              <h3 className="detalle-title">Dirección</h3>
              <button className="detalle-edit-btn" onClick={abrirModalEditarDireccion}>
                Editar
              </button>
            </div>
            <p className="detalle-info-line">{shipping.address}</p>
            {shipping.localidad && (
              <p className="detalle-info-line"><strong>Localidad:</strong> {shipping.localidad}</p>
            )}
            {shipping.province && (
              <p className="detalle-info-line"><strong>Provincia:</strong> {shipping.province}</p>
            )}
            {shipping.postalCode && (
              <p className="detalle-info-line"><strong>CP:</strong> {shipping.postalCode}</p>
            )}
          </div>
        )}

        {shipping.method === "correo-branch" && (
          <div className="detalle-box">
            <div className="detalle-header-row">
              <h3 className="detalle-title">Sucursal</h3>
              <button className="detalle-edit-btn" onClick={abrirModalEditarDireccion}>
                Editar
              </button>
            </div>
            {shipping.branchName && (
              <p className="detalle-info-line"><strong>Nombre:</strong> {shipping.branchName}</p>
            )}
            {shipping.branchAddress && (
              <p className="detalle-info-line"><strong>Dirección:</strong> {shipping.branchAddress}</p>
            )}
            {shipping.localidad && (
              <p className="detalle-info-line"><strong>Localidad:</strong> {shipping.localidad}</p>
            )}
            {shipping.province && (
              <p className="detalle-info-line"><strong>Provincia:</strong> {shipping.province}</p>
            )}
            {shipping.postalCode && (
              <p className="detalle-info-line"><strong>CP:</strong> {shipping.postalCode}</p>
            )}
          </div>
        )}

        {/* ENVÍO */}
        <div className="detalle-box">
          <h3 className="detalle-title">Envío</h3>

          <p className="detalle-info-line">
            <strong>Método:</strong> {renderMetodo(shipping.method)}
          </p>

          {shipping.address && (shipping.method === "correo-home" || shipping.method === "home") && (
            <p className="detalle-info-line">
              <strong>Dirección:</strong> {shipping.address}
            </p>
          )}

          {shipping.localidad && (
            <p className="detalle-info-line">
              <strong>Localidad:</strong> {shipping.localidad}
            </p>
          )}

          {shipping.province && (
            <p className="detalle-info-line">
              <strong>Provincia:</strong> {shipping.province}
            </p>
          )}

          {shipping.postalCode && (
            <p className="detalle-info-line">
              <strong>CP:</strong> {shipping.postalCode}
            </p>
          )}

          {shipping.pickPoint && (
            <p className="detalle-info-line">
              <strong>Pick Up:</strong> {shipping.pickPoint}
              {(() => {
                const pick = shipping.pickPoint?.toUpperCase();
                if (pick.includes('TEMPERLEY')) {
                  return (
                    <span style={{
                      display: 'inline-block',
                      marginLeft: 8,
                      color: '#00bfff', // celeste
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                    }}>T</span>
                  );
                }
                if (pick.includes('AQUELARRE')) {
                  return (
                    <span style={{
                      display: 'inline-block',
                      marginLeft: 8,
                      color: '#e75480', // rosado
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                    }}>A</span>
                  );
                }
                return null;
              })()}
            </p>
          )}

          <p className="detalle-info-line">
            <strong>ETA:</strong> {shipping.eta}
          </p>

          {shipping.tracking && (
            <>
              <p className="detalle-info-line">
                <strong>Seguimiento:</strong> {shipping.tracking}
              </p>
              <button className="detalle-copy-btn" onClick={copiarSeguimiento}>
                Copiar código
              </button>
            </>
          )}
        </div>

      </div>

      {correoModal.isOpen && (
        <NotificationModal
          mensaje={correoModal.message}
          tipo={correoModal.type}
          onClose={closeCorreoModal}
        />
      )}

      {/* ============================
          FACTURACIÓN
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Facturación</h3>

        <p className="detalle-info-line">
          <strong>Estado:</strong>{" "}
          {venta.facturaNumero ? "Facturado" : "Pendiente"}
        </p>

        {venta.facturaNumero && (
          <>
            <p className="detalle-info-line">
              <strong>Número de factura:</strong> {venta.facturaNumero}
            </p>

            <button className="factura-btn" onClick={descargarPDF}>
              Descargar PDF
            </button>

            <button className="factura-btn reenviar" onClick={reenviarFactura}>
              Reenviar factura
            </button>
          </>
        )}
      </div>

      {/* ============================
          HISTORIAL
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Historial</h3>
        <ul className="detalle-historial">
          {timeline.map((item, index) => (
            <li key={index}>
              <strong>{item.date}:</strong> {item.status}
            </li>
          ))}
        </ul>
      </div>

      {/* ============================
          COMENTARIOS DEL CLIENTE
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Comentarios del cliente</h3>
        {isEditingComentario ? (
          <>
            <textarea
              className="detalle-comentarios-edit"
              value={comentarioEditado}
              onChange={e => setComentarioEditado(e.target.value)}
              rows={3}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <button className="factura-btn confirm" style={{ marginRight: 8 }} onClick={guardarComentario} disabled={guardandoComentario}>
              {guardandoComentario ? 'Guardando...' : 'Guardar'}
            </button>
            <button className="factura-btn cancel" onClick={() => setIsEditingComentario(false)} disabled={guardandoComentario}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            {venta.comentarios ? (
              <p className="detalle-comentarios">{venta.comentarios}</p>
            ) : (
              <p className="detalle-comentarios detalle-comentarios-vacio">
                Sin comentarios
              </p>
            )}
            <button className="factura-btn" style={{ marginTop: 8 }} onClick={() => {
              setComentarioEditado(venta.comentarios || '');
              setIsEditingComentario(true);
            }}>
              Editar comentario
            </button>
          </>
        )}
      </div>

      {/* ============================
          REGALO
      ============================ */}
      {venta.isGift && (
        <div className="detalle-box detalle-gift-box">
          <h3 className="detalle-title">
            🎁 Es para regalo
          </h3>

          {venta.giftMessage && (
            <div className="detalle-gift-message">
              <strong>Mensaje personalizado:</strong>
              <p className="detalle-gift-message-text">{venta.giftMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* ============================
          MODALES DE FACTURACIÓN
      ============================ */}

      {/* Modal 1: Confirmación inicial */}
      <FacturaModal
        isOpen={modalFactura === 'confirmar'}
        title="Generar Factura en ARCA"
        message="¿Estás seguro de que querés generar la factura en ARCA para esta venta?"
        onConfirm={confirmarFactura}
        onCancel={() => setModalFactura(null)}
        loading={cargandoFactura}
      />

      {/* Modal 2: Seleccionar tipo de factura */}
      {modalFactura === 'tipo' && (
        <div className="factura-modal-overlay" onClick={() => setModalFactura(null)}>
          <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="factura-modal-title">Tipo de Factura</h2>
            <p className="factura-modal-message">¿Qué tipo de factura quieres generar?</p>
            <div className="factura-modal-actions" style={{ flexDirection: 'column', gap: '12px' }}>
              <button
                className="factura-modal-btn confirm"
                onClick={() => seleccionarTipoFactura('C')}
                style={{ background: '#4caf50' }}
              >
                Factura C (Consumidor Final)
              </button>
              <button
                className="factura-modal-btn confirm"
                onClick={() => seleccionarTipoFactura('A')}
                style={{ background: '#2196f3' }}
              >
                Factura A (Responsable Inscripto)
              </button>
              <button
                className="factura-modal-btn cancel"
                onClick={() => setModalFactura(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Ingresar CUIT */}
      {modalFactura === 'cuit' && (
        <div className="factura-modal-overlay" onClick={() => setModalFactura(null)}>
          <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="factura-modal-title">Factura A - CUIT del Cliente</h2>
            <p className="factura-modal-message">Ingresa el CUIT del cliente (sin guiones)</p>
            <input
              type="text"
              placeholder="Ej: 20123456789"
              id="cuit-input"
              className="factura-modal-input"
              maxLength="11"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const cuit = document.getElementById('cuit-input').value;
                  confirmarCUIT(cuit);
                }
              }}
            />
            <div className="factura-modal-actions">
              <button
                className="factura-modal-btn cancel"
                onClick={() => setModalFactura(null)}
              >
                Cancelar
              </button>
              <button
                className="factura-modal-btn confirm"
                onClick={() => {
                  const cuit = document.getElementById('cuit-input').value;
                  confirmarCUIT(cuit);
                }}
                disabled={cargandoFactura}
              >
                {cargandoFactura ? 'Procesando...' : 'Generar Factura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          MODAL DE ÉXITO
      ============================ */}
      {modalExito && (
        <div className="factura-modal-overlay" onClick={() => setModalExito(null)}>
          <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-success-icon">✅</div>
            <h2 className="factura-modal-title">¡Factura Generada!</h2>

            <div className="modal-factura-datos">
              <div className="dato-item">
                <span className="dato-label">Número de Factura:</span>
                <span className="factura-numero">{modalExito.numero}</span>
              </div>
              <div className="dato-item">
                <span className="dato-label">CAE (Código de Autorización):</span>
                <span className="dato-valor">{modalExito.cae}</span>
              </div>
              <div className="dato-item">
                <span className="dato-label">Vencimiento CAE:</span>
                <span className="dato-valor">{modalExito.vencimiento}</span>
              </div>
            </div>

            <button
              className="factura-modal-btn confirm"
              onClick={() => setModalExito(null)}
              style={{ width: '100%' }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {modalEditarCliente && (
        <div className="factura-modal-overlay" onClick={() => setModalEditarCliente(false)}>
          <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="factura-modal-title">Editar datos del cliente</h2>
            <div className="detalle-modal-form-grid">
              <label className="detalle-modal-label">
                Nombre
                <input
                  className="detalle-modal-input"
                  name="name"
                  value={clienteForm.name}
                  onChange={handleClienteInputChange}
                  placeholder="Nombre y apellido"
                />
              </label>
              <label className="detalle-modal-label">
                Email
                <input
                  className="detalle-modal-input"
                  name="email"
                  value={clienteForm.email}
                  onChange={handleClienteInputChange}
                  placeholder="mail@ejemplo.com"
                  type="email"
                />
              </label>
              <label className="detalle-modal-label">
                WhatsApp
                <input
                  className="detalle-modal-input"
                  name="phone"
                  value={clienteForm.phone}
                  onChange={handleClienteInputChange}
                  placeholder="11XXXXXXXX"
                />
              </label>
              <label className="detalle-modal-label">
                DNI
                <input
                  className="detalle-modal-input"
                  name="dni"
                  value={clienteForm.dni}
                  onChange={handleClienteInputChange}
                  placeholder="Solo numeros"
                />
              </label>
            </div>
            <div className="factura-modal-actions">
              <button
                className="factura-modal-btn cancel"
                onClick={() => setModalEditarCliente(false)}
                disabled={guardandoCliente}
              >
                Cancelar
              </button>
              <button
                className="factura-modal-btn confirm"
                onClick={guardarCliente}
                disabled={guardandoCliente}
              >
                {guardandoCliente ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarDireccion && (
        <div className="factura-modal-overlay" onClick={() => setModalEditarDireccion(false)}>
          <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="factura-modal-title">Editar datos de direccion</h2>
            <div className="detalle-modal-form-grid">
              {(shipping.method === "home" || shipping.method === "correo-home") && (
                <label className="detalle-modal-label detalle-modal-label-full">
                  Direccion
                  <input
                    className="detalle-modal-input"
                    name="address"
                    value={direccionForm.address}
                    onChange={handleDireccionInputChange}
                    placeholder="Calle y altura"
                  />
                </label>
              )}

              {shipping.method === "correo-branch" && (
                <>
                  <label className="detalle-modal-label">
                    Nombre sucursal
                    <input
                      className="detalle-modal-input"
                      name="branchName"
                      value={direccionForm.branchName}
                      onChange={handleDireccionInputChange}
                      placeholder="Sucursal"
                    />
                  </label>
                  <label className="detalle-modal-label">
                    Direccion sucursal
                    <input
                      className="detalle-modal-input"
                      name="branchAddress"
                      value={direccionForm.branchAddress}
                      onChange={handleDireccionInputChange}
                      placeholder="Direccion de sucursal"
                    />
                  </label>
                </>
              )}

              <label className="detalle-modal-label">
                Localidad
                <input
                  className="detalle-modal-input"
                  name="localidad"
                  value={direccionForm.localidad}
                  onChange={handleDireccionInputChange}
                  placeholder="Localidad"
                />
              </label>
              <label className="detalle-modal-label">
                Provincia
                <input
                  className="detalle-modal-input"
                  name="province"
                  value={direccionForm.province}
                  onChange={handleDireccionInputChange}
                  placeholder="Provincia"
                />
              </label>
              <label className="detalle-modal-label">
                Codigo postal
                <input
                  className="detalle-modal-input"
                  name="postalCode"
                  value={direccionForm.postalCode}
                  onChange={handleDireccionInputChange}
                  placeholder="CP"
                />
              </label>
            </div>
            <div className="factura-modal-actions">
              <button
                className="factura-modal-btn cancel"
                onClick={() => setModalEditarDireccion(false)}
                disabled={guardandoDireccion}
              >
                Cancelar
              </button>
              <button
                className="factura-modal-btn confirm"
                onClick={guardarDireccion}
                disabled={guardandoDireccion}
              >
                {guardandoDireccion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <NotificationModal
          mensaje={modalError}
          tipo="error"
          onClose={() => setModalError(null)}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN (cancelar / devolver) */}
      {confirmModal.open && (
        <div className="admin-confirm-overlay" onClick={() => setConfirmModal({ open: false, action: null })}>
          <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmModal.action === "cancelar" ? "Cancelar venta" : "Devolver dinero"}
            </h3>
            <p>
              {confirmModal.action === "cancelar"
                ? "¿Estás seguro de que querés cancelar esta venta? Se enviará un email al cliente."
                : "¿Estás seguro de que querés devolver el dinero? Se procesará el reembolso y se enviará un email al cliente."}
            </p>
            <div className="admin-confirm-actions">
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() => setConfirmModal({ open: false, action: null })}
              >
                No, volver
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={ejecutarAccionConfirmada}
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO (éxito / error) */}
      {resultModal && (
        <NotificationModal
          mensaje={resultModal.mensaje}
          tipo={resultModal.tipo}
          onClose={() => setResultModal(null)}
        />
      )}
    </div>
  );
}