import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/adminsales.css";
import { salesData } from "../data/salesData";

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
  // DATOS DE VENTAS (desde salesData)
  // ============================
  const [ventasData, setVentasData] = useState(salesData);

  const ventasFiltradas = ventasData.filter((venta) =>
    [venta.id, venta.cliente, venta.email, venta.telefono]
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
      const todos = ventasFiltradas.map((v) => v.id);
      setSeleccionadas(todos);
      setSelectAll(true);
    }
  }

  // Acciones masivas
  function ejecutarAccion(nombre) {
    alert(`Acción ejecutada: ${nombre} para ${seleccionadas.length} ventas`);
    setAccionesAbiertas(false);
  }

  // Marcar pago recibido
  function marcarPagoRecibido(id) {
    setVentasData((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, pagoEstado: "recibido" } : v
      )
    );
  }

  // Abrir popup seguimiento
  function abrirPopup(id) {
    setVentaSeleccionada(id);
    setCodigoSeguimiento("");
    setPopupAbierto(true);
  }

  // Guardar seguimiento
  function guardarSeguimiento() {
    setVentasData((prev) =>
      prev.map((v) =>
        v.id === ventaSeleccionada
          ? { ...v, envioEstado: "enviado", seguimiento: codigoSeguimiento }
          : v
      )
    );
    setPopupAbierto(false);
  }

  // Expandir/colapsar fila
  function toggleExpand(id) {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">
        Ventas <span className="sales-count">(5880 abiertas)</span>
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
              <button onClick={() => ejecutarAccion("Cancelar ventas")}>
                Cancelar ventas
              </button>
              <button onClick={() => ejecutarAccion("Archivar ventas")}>
                Archivar ventas
              </button>
              <button onClick={() => ejecutarAccion("Marcar pagos como recibidos")}>
                Marcar pagos como recibidos
              </button>
              <button onClick={() => ejecutarAccion("Marcar como empaquetadas")}>
                Marcar como empaquetadas
              </button>
              <button onClick={() => ejecutarAccion("Marcar y notificar como enviadas")}>
                Marcar y notificar como enviadas
              </button>
              <button onClick={() => ejecutarAccion("Imprimir resumen del pedido")}>
                Imprimir resumen del pedido
              </button>
              <button onClick={() => ejecutarAccion("Facturación Masiva")}>
                Facturación Masiva
              </button>
              <button onClick={() => ejecutarAccion("Registrar órdenes en Correo Argentino")}>
                Registrar órdenes en Correo Argentino
              </button>
              <button onClick={() => ejecutarAccion("Andreani - Descargar Etiquetas")}>
                Andreani - Descargar Etiquetas
              </button>
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
              <React.Fragment key={venta.id}>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(venta.id)}
                      onChange={() => toggleSeleccion(venta.id)}
                    />
                  </td>

                  <td>
                    <Link
                      to={`/admin/sales/${venta.id}`}
                      className="venta-link"
                    >
                      #{venta.id}
                    </Link>
                  </td>

                  <td>{venta.fecha}</td>

                  {/* CLIENTE + ICONOS */}
                  <td className="cliente-cell">
                    {venta.cliente}

                    {venta.comentarios && (
                      <span className="icono-comentario">
                        💬
                        <span className="tooltip-comentario">
                          {venta.comentarios}
                        </span>
                      </span>
                    )}

                    {venta.esRegalo && (
                      <span className="icono-regalo">🎁</span>
                    )}
                  </td>

                  <td>{venta.total}</td>

                  {/* Productos */}
                  <td>
                    <button
                      className="productos-toggle"
                      onClick={() => toggleExpand(venta.id)}
                    >
                      {Array.isArray(venta.items) ? venta.items.length : 0} producto
                      {Array.isArray(venta.items) && venta.items.length !== 1
                        ? "s"
                        : ""}{" "}
                      <span
                        className={
                          expandedRows.includes(venta.id) ? "flecha up" : "flecha"
                        }
                      >
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
                        <span className="payment-status pending">
                          No recibido
                        </span>
                        <button
                          className="mark-paid-btn"
                          onClick={() => marcarPagoRecibido(venta.id)}
                        >
                          Marcar como recibido
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Método de envío */}
                  <td className="shipping-method-cell">
                    {venta.shippingMethod === "andreani" && "📦 Andreani"}
                    {venta.shippingMethod === "correo" && "✉️ Correo Argentino"}
                    {venta.shippingMethod === "retiro_temperley" && "🏬 Retiro Temperley"}
                    {venta.shippingMethod === "retiro_aquelarre" && "🏬 Retiro Aquelarre"}
                    {venta.shippingMethod === "nextday_moto" && "🏍️ Envío Next Day 24 hs (Moto CABA y GBA Sur)"}
                  </td>


                  {/* Envío */}
                  <td>
                    {venta.envioEstado === "enviado" ? (
                      <span className="envio-status enviado">✈️ Enviado</span>
                    ) : (
                      <button
                        className="envio-pendiente-btn"
                        onClick={() => abrirPopup(venta.id)}
                      >
                        Agregar seguimiento
                      </button>
                    )}
                  </td>
                </tr>

                {/* Fila expandida */}
                {expandedRows.includes(venta.id) && (
                  <tr className="fila-expandida">
                    <td colSpan="9">
                      <div className="productos-grid">
                        {Array.isArray(venta.items) &&
                          venta.items.map((item, index) => (
                            <div key={index} className="producto-card">
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="producto-img"
                              />
                              <div className="producto-info">
                                <div className="producto-nombre">
                                  {item.nombre}
                                </div>
                                <div className="producto-detalle">
                                  {item.color}, {item.talle} — {item.cantidad}{" "}
                                  unid.
                                </div>
                                <div className="producto-precio">
                                  ${item.precio.toLocaleString()} c/u — Total: $
                                  {(item.precio * item.cantidad).toLocaleString()}
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
              <button
                className="popup-cancel"
                onClick={() => setPopupAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className="popup-send"
                onClick={guardarSeguimiento}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
