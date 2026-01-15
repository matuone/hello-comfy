import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../styles/adminsaledetail.css";

export default function AdminSaleDetail() {
  const { id } = useParams();

  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const appsRef = useRef(null);
  const moreRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  // ============================
  // CARGAR VENTA DESDE BACKEND
  // ============================
  useEffect(() => {
    async function fetchVenta() {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
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
  async function facturarVenta() {
    if (!window.confirm("¿Seguro que querés facturar esta venta?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "facturado",
            facturar: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Error al facturar: " + (data.error || "Desconocido"));
        return;
      }

      alert("Factura generada correctamente");

      // Actualizar venta en pantalla
      setVenta(data.order);
    } catch (err) {
      console.error("Error facturando:", err);
      alert("Error al facturar la venta");
    }
  }

  // ============================
  // DESCARGAR PDF (placeholder)
  // ============================
  function descargarPDF() {
    alert("Descargar PDF todavía no está conectado a Facturante");
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

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Orden: {venta.code}</h2>
      <p className="admin-section-text">Detalle completo de la venta.</p>

      {/* ============================
          BOTONES DE ACCIÓN
      ============================ */}
      <div className="detalle-actions">

        {/* Facturar esta venta */}
        <button className="facturar-btn" onClick={facturarVenta}>
          Facturar esta venta
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

          {venta.items.map((item, i) => (
            <div key={i} className="detalle-info-line">
              <strong>{item.name}</strong> — {item.quantity} unid. — $
              {item.price.toLocaleString("es-AR")}
            </div>
          ))}

          <p className="detalle-info-line">
            <strong>Total pagado:</strong> ${venta.totals.total.toLocaleString("es-AR")}
          </p>
        </div>

        {/* CLIENTE */}
        <div className="detalle-box">
          <h3 className="detalle-title">Cliente</h3>
          <p className="detalle-info-line"><strong>Nombre:</strong> {venta.customer.name}</p>
          <p className="detalle-info-line"><strong>Email:</strong> {venta.customer.email}</p>
        </div>

        {/* DIRECCIÓN */}
        {venta.shipping.method === "home" && (
          <div className="detalle-box">
            <h3 className="detalle-title">Dirección</h3>
            <p className="detalle-info-line">{venta.shipping.address}</p>
          </div>
        )}

        {/* ENVÍO */}
        <div className="detalle-box">
          <h3 className="detalle-title">Envío</h3>

          <p className="detalle-info-line">
            <strong>Método:</strong> {renderMetodo(venta.shipping.method)}
          </p>

          {venta.shipping.pickPoint && (
            <p className="detalle-info-line">
              <strong>Pick Up:</strong> {venta.shipping.pickPoint}
            </p>
          )}

          <p className="detalle-info-line">
            <strong>ETA:</strong> {venta.shipping.eta}
          </p>

          {venta.shipping.tracking && (
            <>
              <p className="detalle-info-line">
                <strong>Seguimiento:</strong> {venta.shipping.tracking}
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
          {venta.timeline.map((item, index) => (
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

        {venta.comentarios ? (
          <p className="detalle-comentarios">{venta.comentarios}</p>
        ) : (
          <p className="detalle-comentarios detalle-comentarios-vacio">
            Sin comentarios
          </p>
        )}
      </div>

    </div>
  );
}
