import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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

  // ============================
  // PICKUP NOTIFY MODAL
  // ============================
  const [modalPickup, setModalPickup] = useState(false);
  // Estado para errores de modal (notificaciones)
  const [modalError, setModalError] = useState(null);
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [enviandoPickup, setEnviandoPickup] = useState(false);
  const [fechaRetiroFecha, setFechaRetiroFecha] = useState("");
  const [fechaRetiroHora, setFechaRetiroHora] = useState("");

  async function enviarNotificacionPickup() {
    if (!fechaRetiroFecha || !fechaRetiroHora) {
      setModalError("Debes ingresar la fecha/hora para retirar.");
      return;
    }
    setEnviandoPickup(true);
    try {
      const fecha = new Date(`${fechaRetiroFecha}T${fechaRetiroHora}`);
      const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fechaStr = fecha.toLocaleDateString('es-AR', opciones);
      let horaStr = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
      const fechaHoraFinal = `${fechaStr} a las ${horaStr}`;
      const res = await fetch(apiPath(`/admin/orders/${id}/pickup-notify`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const appsRef = useRef(null);
  const moreRef = useRef(null);

  const token = localStorage.getItem("adminToken");
  // Verificar token y redirigir si falta
  useEffect(() => {
    if (!token) {
      window.location.href = "/admin/login"; // Si tienes una ruta de login admin en el frontend, mantenla. Si necesitas redirigir al backend, usa la URL completa.
    }
  }, [token]);

  // ============================
  // CARGAR VENTA DESDE BACKEND
  // ============================
  useEffect(() => {
    async function fetchVenta() {
      try {
        const res = await fetch(apiPath(`/admin/orders/${id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setVenta(data);
      } catch (err) {
        console.error("Error cargando venta:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVenta();
  }, [id, token]);

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

      const res = await fetch(
        apiPath(`/afip/generar-factura/${id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
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
        return "📦 Envío a domicilio";
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
  // ESTADO Y LÓGICA DE EDICIÓN DE COMENTARIO
  // ============================
  const [isEditingComentario, setIsEditingComentario] = useState(false);
  const [comentarioEditado, setComentarioEditado] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);

  async function guardarComentario() {
    setGuardandoComentario(true);
    try {
      const res = await fetch(apiPath(`/admin/orders/${id}/comentario`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
                {/* Botón WhatsApp SIEMPRE visible, pero deshabilitado si falta teléfono o fecha/hora */}
                <a
                  className="factura-modal-btn confirm"
                  style={{ background: "#25d366", color: "white", textAlign: 'center', textDecoration: 'none', opacity: customer?.whatsapp && fechaRetiroFecha && fechaRetiroHora ? 1 : 0.5, pointerEvents: customer?.whatsapp && fechaRetiroFecha && fechaRetiroHora ? 'auto' : 'none' }}
                  href={customer?.whatsapp && fechaRetiroFecha && fechaRetiroHora ? `https://wa.me/${customer.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(getMensajeWhatsapp({ nombre: customer.name, fecha: fechaRetiroFecha, hora: fechaRetiroHora, pickPoint: shipping.pickPoint, numeroOrden: venta.code }))}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={customer?.whatsapp ? '' : 'El cliente no tiene WhatsApp'}
                >
                  Enviar WhatsApp
                </a>
                <button
                  className="factura-modal-btn cancel"
                  onClick={() => setModalPickup(false)}
                  disabled={enviandoPickup}
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
            <button>Registrar orden en Correo Argentino</button>
            <button>Registrar orden en Andreani</button>
          </div>
        </div>

        <div className="dropdown" ref={moreRef}>
          <button className="dropdown-btn" onClick={toggleMore}>
            Más opciones ▾
          </button>
          <div className={`dropdown-menu ${isMoreOpen ? "open" : ""}`}>
            <button>Cancelar venta</button>
            <button>Devolver dinero</button>
            <button>Archivar venta</button>
          </div>
        </div>

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
              <strong>{item.name}</strong> — {item.quantity} unid. — $
              {item.price?.toLocaleString("es-AR")}
            </div>
          )) : <p className="detalle-info-line">No hay productos en la venta.</p>}

          <p className="detalle-info-line">
            <strong>Total pagado:</strong> ${(totals.total || 0).toLocaleString("es-AR")}
          </p>
        </div>

        {/* CLIENTE */}
        <div className="detalle-box">
          <h3 className="detalle-title">Cliente</h3>
          <p className="detalle-info-line"><strong>Nombre:</strong> {customer.name}</p>
          <p className="detalle-info-line"><strong>Email:</strong> {customer.email}</p>
          {/* Teléfono eliminado, solo WhatsApp disponible */}
        </div>

        {/* DIRECCIÓN */}
        {shipping.method === "home" && (
          <div className="detalle-box">
            <h3 className="detalle-title">Dirección</h3>
            <p className="detalle-info-line">{shipping.address}</p>
          </div>
        )}

        {/* ENVÍO */}
        <div className="detalle-box">
          <h3 className="detalle-title">Envío</h3>

          <p className="detalle-info-line">
            <strong>Método:</strong> {renderMetodo(shipping.method)}
          </p>

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

      {modalError && (
        <NotificationModal
          mensaje={modalError}
          tipo="error"
          onClose={() => setModalError(null)}
        />
      )}
    </div>
  );
}