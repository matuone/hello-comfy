import { useState } from "react";
import "../styles/admincustomers.css";

function parseFechaDDMMYYYY(str) {
  if (!str) return null;
  const [dd, mm, yyyy] = str.split("/");
  if (!dd || !mm || !yyyy) return null;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

export default function AdminCustomers() {
  const [busqueda, setBusqueda] = useState("");

  // ============================
  // FILTROS AVANZADOS
  // ============================
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [totalMin, setTotalMin] = useState("");
  const [totalMax, setTotalMax] = useState("");
  const [soloSinCompras, setSoloSinCompras] = useState(false);

  // ============================
  // EXPORTAR CSV
  // ============================
  function exportarCSV(lista) {
    if (!lista.length) {
      alert("No hay clientes para exportar.");
      return;
    }

    const encabezados = [
      "Nombre",
      "Email",
      "WhatsApp",
      "Última compra",
      "Total consumido"
    ];

    const filas = lista.map(c => [
      c.nombre,
      c.email,
      c.whatsapp,
      c.ultimaCompra ? `#${c.ultimaCompra.nro} ${c.ultimaCompra.fecha}` : "—",
      c.total
    ]);

    const contenido = [
      encabezados.join(","),
      ...filas.map(f => f.join(","))
    ].join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "clientes_exportados.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  // ============================
  // MOCK DE CLIENTES
  // ============================
  const clientes = [
    {
      nombre: "Cristian Weiss",
      ultimaCompra: null,
      total: 0,
      email: "cristian@example.com",
      whatsapp: "+5491123456789",
    },
    {
      nombre: "Lara Ailen Iris Mateo",
      ultimaCompra: { nro: 4033, fecha: "16/11/2023" },
      total: 49000,
      email: "lara@example.com",
      whatsapp: "+5491123456790",
    },
    {
      nombre: "María Laura Ambroggio",
      ultimaCompra: { nro: 7552, fecha: "06/06/2025" },
      total: 35318.74,
      email: "mlaura@example.com",
      whatsapp: "+5491123456791",
    },
    {
      nombre: "Camila Oshiro",
      ultimaCompra: { nro: 2144, fecha: "26/04/2023" },
      total: 5313.04,
      email: "camila@example.com",
      whatsapp: "+5491123456792",
    },
    {
      nombre: "guadalupe dominguez",
      ultimaCompra: null,
      total: 0,
      email: "guada@example.com",
      whatsapp: "+5491123456793",
    },
  ];

  // ============================
  // APLICAR FILTROS
  // ============================
  const filtrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(texto) ||
      (c.email && c.email.toLowerCase().includes(texto));

    if (!coincideBusqueda) return false;

    // Filtro: solo sin compras
    if (soloSinCompras && c.ultimaCompra !== null) return false;

    // Filtro por total consumido
    const min = totalMin !== "" ? Number(totalMin) : null;
    const max = totalMax !== "" ? Number(totalMax) : null;

    if (min !== null && c.total < min) return false;
    if (max !== null && c.total > max) return false;

    // Filtro por fecha de última compra
    if (fechaDesde || fechaHasta) {
      if (!c.ultimaCompra) return false;

      const fechaCompra = parseFechaDDMMYYYY(c.ultimaCompra.fecha);
      if (!fechaCompra) return false;

      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        if (fechaCompra < desde) return false;
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fechaCompra > hasta) return false;
      }
    }

    return true;
  });

  function limpiarFiltros() {
    setFechaDesde("");
    setFechaHasta("");
    setTotalMin("");
    setTotalMax("");
    setSoloSinCompras(false);
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Clientes</h2>
      <p className="admin-section-text">
        Historial de compras, contacto y consumo total.
      </p>

      {/* ============================
          BUSCADOR
      ============================ */}
      <input
        type="text"
        className="clientes-search"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* ============================
          ACCIONES SUPERIORES
      ============================ */}
      <div className="clientes-toolbar">
        <div className="clientes-toolbar-left">
          <button
            className="btn-filtros"
            onClick={() => setMostrarFiltros((prev) => !prev)}
          >
            Filtros {mostrarFiltros ? "▴" : "▾"}
          </button>
        </div>

        <div className="clientes-toolbar-right">
          <button className="btn-nuevo-cliente">+ Agregar nuevo cliente</button>

          <div className="clientes-opciones">
            <button className="btn-opciones">Más opciones ▾</button>
            <div className="opciones-menu">
              <button onClick={() => exportarCSV(filtrados)}>
                Exportar lista
              </button>
              <button>Importar clientes</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
          PANEL DE FILTROS
      ============================ */}
      {mostrarFiltros && (
        <div className="clientes-filtros-panel">
          <div className="filtros-group">
            <span className="filtros-title">Última compra</span>
            <div className="filtros-row">
              <div className="filtro-item">
                <label>Desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>
              <div className="filtro-item">
                <label>Hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filtros-group">
            <span className="filtros-title">Total consumido</span>
            <div className="filtros-row">
              <div className="filtro-item">
                <label>Mínimo</label>
                <input
                  type="number"
                  value={totalMin}
                  onChange={(e) => setTotalMin(e.target.value)}
                  placeholder="Ej: 10000"
                />
              </div>
              <div className="filtro-item">
                <label>Máximo</label>
                <input
                  type="number"
                  value={totalMax}
                  onChange={(e) => setTotalMax(e.target.value)}
                  placeholder="Ej: 50000"
                />
              </div>
            </div>
          </div>

          <div className="filtros-group filtros-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={soloSinCompras}
                onChange={(e) => setSoloSinCompras(e.target.checked)}
              />
              Solo clientes sin compras
            </label>
          </div>

          <div className="filtros-actions">
            <button className="filtros-clear" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* ============================
          TABLA DE CLIENTES
      ============================ */}
      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Última compra</th>
              <th>Total consumido</th>
              <th>Contactar</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c, i) => (
              <tr key={i}>
                <td>{c.nombre}</td>
                <td>
                  {c.ultimaCompra
                    ? `#${c.ultimaCompra.nro} ${c.ultimaCompra.fecha}`
                    : "—"}
                </td>
                <td>
                  $
                  {c.total.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="contacto-cell">
                  <a href={`mailto:${c.email}`} title="Email">
                    📧
                  </a>
                  <a
                    href={`https://wa.me/${c.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    title="WhatsApp"
                  >
                    💬
                  </a>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan="4" className="clientes-empty">
                  No se encontraron clientes con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
