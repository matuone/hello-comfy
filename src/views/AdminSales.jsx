import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/adminsales.css";
import ReenviarModal from "../components/ReenviarModal";

export default function AdminSales() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [accionesAbiertas, setAccionesAbiertas] = useState(false);
  const accionesRef = useRef(null);

  const [popupAbierto, setPopupAbierto] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");

  const [expandedRows, setExpandedRows] = useState([]);

  // Modal de reenvío de factura
  const [modalReenvio, setModalReenvio] = useState(false);
  const [reenvioLoading, setReenvioLoading] = useState(false);

  // ============================
  // DATOS DE VENTAS (BACKEND)
  // ============================
  const [ventasData, setVentasData] = useState([]);
  const [error, setError] = useState(false);

  // Redirigir si no hay token
  useEffect(() => {
    if (!token) {
      navigate("/mi-cuenta");
    }
  }, [token, navigate]);

  // Fetch de ventas
  useEffect(() => {
    if (!token) return;

    async function fetchVentas() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Error cargando ventas:", await res.text());
          setError(true);
          return;
        }

        const data = await res.json();
        setVentasData(data);
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setError(true);
      }
    }

    fetchVentas();
  }, [token]);

  // Filtrado
  const ventasFiltradas = ventasData.filter((venta) =>
    [
      venta._id,
      venta.customer?.name,
      venta.customer?.email,
      venta.totals?.total,
    ]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Selección individual
  function toggleSeleccion(id) {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Seleccionar todas
  function toggleSeleccionarTodas() {
    if (selectAll) {
      setSeleccionadas([]);
      setSelectAll(false);
    } else {
      const todos = ventasFiltradas.map((v) => v._id);
      setSeleccionadas(todos);
      setSelectAll(true);
    }
  }

  // ============================
  // FACTURACIÓN MASIVA
  // ============================
  async function facturarSeleccionadas() {
    if (seleccionadas.length === 0) {
      alert("No seleccionaste ninguna venta");
      return;
    }

    const tipoFactura = window.confirm(
      "¿Factura A (con CUIT)? Cancelar para Factura C (consumidor final)"
    )
      ? "A"
      : "C";

    if (!window.confirm(`¿Generar factura ${tipoFactura} en ARCA para ${seleccionadas.length} venta(s)?`)) {
      return;
    }

    try {
      const body = {
        tipoFactura,
      };

      // Si es Factura A, solicitar CUIT
      if (tipoFactura === "A") {
        const cuitCliente = window.prompt("Ingresa el CUIT del cliente (ej: 20123456789)");
        if (!cuitCliente || cuitCliente.length < 11) {
          alert("CUIT inválido");
          return;
        }
        body.cuitCliente = cuitCliente;
      }

      // Generar facturas una por una (AFIP requiere una llamada por factura)
      let exitosas = 0;
      let errores = 0;

      for (const id of seleccionadas) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/afip/generar-factura/${id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(body),
            }
          );

          if (res.ok) {
            exitosas++;
          } else {
            errores++;
          }
        } catch (err) {
          errores++;
        }
      }

      setVentasData((prev) =>
        prev.map((v) =>
          seleccionadas.includes(v._id)
            ? { ...v, facturaNumero: "GENERADA" }
            : v
        )
      );

      alert(`Facturación completada!\n✅ Exitosas: ${exitosas}\n❌ Errores: ${errores}`);
      setAccionesAbiertas(false);
      setSeleccionadas([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Error facturando:", err);
      alert("Error al generar las facturas");
    }
  }

  // ============================
  // DESCARGAR FACTURA (placeholder)
  // ============================
  async function descargarFactura(id) {
    try {
      const url = `http://localhost:5000/api/afip/factura-pdf/${id}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo descargar el PDF');
      }
      const [blob, disposition] = await Promise.all([
        res.blob(),
        Promise.resolve(res.headers.get('Content-Disposition')),
      ]);
      const link = document.createElement('a');
      const filenameMatch = disposition && /filename="?([^";]+)"?/i.exec(disposition);
      const filename = filenameMatch ? filenameMatch[1] : `Factura-${id}.pdf`;
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
  // REENVIAR FACTURA
  // ============================
  async function reenviarFactura(id) {
    setReenvioLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/afip/reenviar-factura/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setModalReenvio({
          tipo: 'error',
          titulo: 'Error al reenviar',
          mensaje: data.error || 'No se pudo reenviar la factura',
        });
        return;
      }

      setModalReenvio({
        tipo: 'exito',
        titulo: '¡Factura reenviada!',
        mensaje: 'La factura ha sido enviada exitosamente al cliente',
      });
    } catch (err) {
      console.error(err);
      setModalReenvio({
        tipo: 'error',
        titulo: 'Error de conexión',
        mensaje: 'No se pudo conectar con el servidor',
      });
    } finally {
      setReenvioLoading(false);
    }
  }

  // ============================
  // MARCAR PAGO RECIBIDO
  // ============================
  async function marcarPagoRecibido(id) {
    try {
      await fetch(`http://localhost:5000/api/admin/orders/${id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pagoEstado: "recibido" }),
      });

      setVentasData((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, pagoEstado: "recibido" } : v
        )
      );
    } catch (err) {
      console.error("Error marcando pago:", err);
    }
  }

  // ============================
  // POPUP SEGUIMIENTO
  // ============================
  function abrirPopup(id) {
    setVentaSeleccionada(id);
    setCodigoSeguimiento("");
    setPopupAbierto(true);
  }

  async function guardarSeguimiento() {
    try {
      await fetch(`http://localhost:5000/api/admin/orders/${ventaSeleccionada}/shipping`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          envioEstado: "enviado",
          seguimiento: codigoSeguimiento,
        }),
      });

      setVentasData((prev) =>
        prev.map((v) =>
          v._id === ventaSeleccionada
            ? { ...v, envioEstado: "enviado", seguimiento: codigoSeguimiento }
            : v
        )
      );

      setPopupAbierto(false);
    } catch (err) {
      console.error("Error guardando seguimiento:", err);
    }
  }

  // Expandir/colapsar fila
  function toggleExpand(id) {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (accionesRef.current && !accionesRef.current.contains(e.target)) {
        setAccionesAbiertas(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================
  // RENDER
  // ============================

  if (error) {
    return (
      <div className="admin-section">
        <h2>Error cargando ventas</h2>
        <p>Verificá que estés logueado correctamente.</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">
        Ventas <span className="sales-count">({ventasData.length})</span>
      </h2>

      <p className="admin-section-text">
        Gestión diaria de pedidos, pagos y envíos.
      </p>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por cliente, email, teléfono o número..."
        className="sales-search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Toolbar */}
      <div className="sales-toolbar">
        <div className="sales-toolbar-left">
          <label className="select-all-label">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSeleccionarTodas}
            />
            Seleccionar todas
          </label>

          <span className="sales-selected-count">
            {seleccionadas.length} seleccionada
            {seleccionadas.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="sales-toolbar-right" ref={accionesRef}>
          <div className="dropdown">
            <button
              className="dropdown-btn"
              onClick={() => setAccionesAbiertas((prev) => !prev)}
            >
              Elegí una acción ▾
            </button>

            <div className={`dropdown-menu ${accionesAbiertas ? "open" : ""}`}>
              <button onClick={() => ejecutarAccion("Cancelar ventas")}>Cancelar ventas</button>
              <button onClick={() => ejecutarAccion("Archivar ventas")}>Archivar ventas</button>
              <button onClick={() => ejecutarAccion("Marcar pagos como recibidos")}>Marcar pagos como recibidos</button>
              <button onClick={() => ejecutarAccion("Marcar como empaquetadas")}>Marcar como empaquetadas</button>
              <button onClick={() => ejecutarAccion("Marcar y notificar como enviadas")}>Marcar y notificar como enviadas</button>
              <button onClick={() => ejecutarAccion("Imprimir resumen del pedido")}>Imprimir resumen del pedido</button>

              {/* ⭐ Facturación con AFIP/ARCA */}
              <button onClick={facturarSeleccionadas}>Generar factura en ARCA</button>

              <button onClick={() => ejecutarAccion("Registrar órdenes en Correo Argentino")}>Registrar órdenes en Correo Argentino</button>
              <button onClick={() => ejecutarAccion("Andreani - Descargar Etiquetas")}>Andreani - Descargar Etiquetas</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Productos</th>
              <th>Pago</th>
              <th>Método</th>
              <th>Envío</th>
              <th>Factura</th>
            </tr>
          </thead>

          <tbody>
            {ventasFiltradas.map((venta) => (
              <React.Fragment key={venta._id}>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(venta._id)}
                      onChange={() => toggleSeleccion(venta._id)}
                    />
                  </td>

                  <td>
                    <Link to={`/admin/sales/${venta._id}`} className="venta-link">
                      Orden: {venta.code}
                    </Link>
                    {venta.isGift && (
                      <span className="gift-indicator-inline">
                        <span className="gift-icon" title={venta.giftMessage || "Es para regalo"}>🎁</span>
                        {venta.giftMessage && (
                          <div className="gift-message-bubble">
                            {venta.giftMessage}
                          </div>
                        )}
                      </span>
                    )}
                  </td>

                  <td>{venta.date}</td>

                  <td className="cliente-cell">
                    <Link to={`/admin/customers/${venta.customer.email}`} className="venta-link">
                      {venta.customer.name || "Cliente"}
                    </Link>
                  </td>

                  <td>${venta.totals.total.toLocaleString("es-AR")}</td>

                  <td>
                    <button
                      className="productos-toggle"
                      onClick={() => toggleExpand(venta._id)}
                    >
                      {venta.items.length} producto
                      {venta.items.length !== 1 ? "s" : ""}{" "}
                      <span className={expandedRows.includes(venta._id) ? "flecha up" : "flecha"}>
                        ▾
                      </span>
                    </button>
                  </td>

                  <td>
                    {venta.pagoEstado === "recibido" ? (
                      <span className="payment-status paid">Recibido</span>
                    ) : (
                      <div className="payment-pending-wrapper">
                        <span className="payment-status pending">No recibido</span>
                        <button
                          className="mark-paid-btn"
                          onClick={() => marcarPagoRecibido(venta._id)}
                        >
                          Marcar como recibido
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="shipping-method-cell">
                    {venta.shipping.method === "home" && "📦 Envío a domicilio"}
                    {venta.shipping.method === "pickup" && "🏬 Pick Up Point"}
                  </td>

                  <td>
                    {venta.envioEstado === "enviado" ? (
                      <span className="envio-status enviado">✈️ Enviado</span>
                    ) : (
                      <button
                        className="envio-pendiente-btn"
                        onClick={() => abrirPopup(venta._id)}
                      >
                        Agregar seguimiento
                      </button>
                    )}
                  </td>

                  <td>
                    {venta.facturaNumero ? (
                      <div className="factura-info">
                        <span className="factura-status facturado">Facturado</span>
                        <div className="factura-num">#{venta.facturaNumero}</div>

                        <button
                          className="factura-btn"
                          onClick={() => descargarFactura(venta._id)}
                        >
                          Descargar PDF
                        </button>

                        <button
                          className="factura-btn reenviar"
                          onClick={() => reenviarFactura(venta._id)}
                        >
                          Reenviar
                        </button>
                      </div>
                    ) : (
                      <Link to={`/admin/sales/${venta._id}`}>
                        <button className="factura-pendiente-btn">Generar factura</button>
                      </Link>
                    )}
                  </td>


                </tr>

                {expandedRows.includes(venta._id) && (
                  <tr className="fila-expandida">
                    <td colSpan="10">
                      <div className="productos-grid">
                        {venta.items.map((item, index) => (
                          <div key={index} className="producto-card">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="producto-img"
                            />
                            <div className="producto-info">
                              <div className="producto-nombre">{item.name}</div>
                              <div className="producto-detalle">
                                {item.quantity} unid.
                              </div>
                              <div className="producto-precio">
                                ${item.price.toLocaleString("es-AR")} c/u — Total: $
                                {(item.price * item.quantity).toLocaleString("es-AR")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {popupAbierto && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Agregar número de seguimiento</h3>

            <p className="popup-venta-info">
              Venta: <strong>#{ventaSeleccionada}</strong>
            </p>

            <input
              type="text"
              placeholder="Ingresá el código..."
              value={codigoSeguimiento}
              onChange={(e) => setCodigoSeguimiento(e.target.value)}
              className="popup-input"
            />

            <div className="popup-buttons">
              <button className="popup-cancel" onClick={() => setPopupAbierto(false)}>
                Cancelar
              </button>
              <button className="popup-send" onClick={guardarSeguimiento}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalReenvio && (
        <ReenviarModal
          tipo={modalReenvio.tipo}
          titulo={modalReenvio.titulo}
          mensaje={modalReenvio.mensaje}
          onClose={() => setModalReenvio(null)}
        />
      )}    </div>
  );
}