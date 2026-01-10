import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/adminsales.css";

export default function AdminSales() {
  const [busqueda, setBusqueda] = useState("");

  // Selección
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dropdown acciones
  const [accionesAbiertas, setAccionesAbiertas] = useState(false);
  const accionesRef = useRef(null);

  // Popup seguimiento
  const [popupAbierto, setPopupAbierto] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");

  // Filas expandidas
  const [expandedRows, setExpandedRows] = useState([]);

  // ============================
  // DATOS DE VENTAS (BACKEND)
  // ============================
  const [ventasData, setVentasData] = useState([]);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    async function fetchVentas() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setVentasData(data);
      } catch (err) {
        console.error("Error cargando ventas:", err);
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

  // Acciones masivas (placeholder)
  function ejecutarAccion(nombre) {
    alert(`Acción ejecutada: ${nombre} para ${seleccionadas.length} ventas`);
    setAccionesAbiertas(false);
  }

  // ============================
  // MARCAR PAGO RECIBIDO (BACKEND)
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
              <button onClick={() => ejecutarAccion("Facturación Masiva")}>Facturación Masiva</button>
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
                      #{venta.code}
                    </Link>
                  </td>

                  <td>{venta.date}</td>

                  {/* Cliente */}
                  <td className="cliente-cell">
                    <Link to={`/admin/customers/${venta.customer.email}`} className="venta-link">
                      {venta.customer.name || "Cliente"}
                    </Link>
                  </td>

                  <td>${venta.totals.total.toLocaleString("es-AR")}</td>

                  {/* Productos */}
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

                  {/* Pago */}
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

                  {/* Método de envío */}
                  <td className="shipping-method-cell">
                    {venta.shipping.method === "home" && "📦 Envío a domicilio"}
                    {venta.shipping.method === "pickup" && "🏬 Pick Up Point"}
                  </td>

                  {/* Envío */}
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
                </tr>

                {/* Fila expandida */}
                {expandedRows.includes(venta._id) && (
                  <tr className="fila-expandida">
                    <td colSpan="9">
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

      {/* POPUP SEGUIMIENTO */}
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
    </div>
  );
}
