import { useState } from "react";
import "../styles/admincustomers.css";
import { salesData } from "../data/salesData";
import { Link } from "react-router-dom";

function parseFechaDDMMYYYY(str) {
  if (!str) return null;
  const [dd, mm, yyyy] = str.split("/");
  if (!dd || !mm || !yyyy) return null;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

export default function AdminCustomers() {
  const [busqueda, setBusqueda] = useState("");

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [totalMin, setTotalMin] = useState("");
  const [totalMax, setTotalMax] = useState("");
  const [soloSinCompras, setSoloSinCompras] = useState(false);

  const clientesBase = [
    { nombre: "Cristian Weiss", email: "cristian@example.com", whatsapp: "+5491123456789" },
    { nombre: "Lara Ailen Iris Mateo", email: "lara@example.com", whatsapp: "+5491123456790" },
    { nombre: "María Laura Ambroggio", email: "mlaura@example.com", whatsapp: "+5491123456791" },
    { nombre: "Camila Oshiro", email: "camila@example.com", whatsapp: "+5491123456792" },
    { nombre: "guadalupe dominguez", email: "guada@example.com", whatsapp: "+5491123456793" },
  ];

  const clientes = clientesBase.map(c => {
    const compras = salesData.filter(v => v.email === c.email);

    const total = compras.reduce((acc, v) => {
      const num = Number(String(v.total).replace(/[^0-9.-]+/g, ""));
      return acc + num;
    }, 0);

    const ultimaCompra = compras.length
      ? compras.reduce((a, b) =>
        parseFechaDDMMYYYY(a.fecha) > parseFechaDDMMYYYY(b.fecha) ? a : b
      )
      : null;

    return {
      ...c,
      compras,
      total,
      ultimaCompra,
    };
  });

  const filtrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(texto) ||
      c.email.toLowerCase().includes(texto);

    if (!coincideBusqueda) return false;

    if (soloSinCompras && c.compras.length > 0) return false;

    const min = totalMin !== "" ? Number(totalMin) : null;
    const max = totalMax !== "" ? Number(totalMax) : null;

    if (min !== null && c.total < min) return false;
    if (max !== null && c.total > max) return false;

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

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Clientes</h2>
      <p className="admin-section-text">
        Historial de compras, contacto y consumo total.
      </p>

      <input
        type="text"
        className="clientes-search"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Última compra</th>
              <th>Total consumido</th>
              <th>Ver</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c, i) => (
              <tr key={i}>
                <td>{c.nombre}</td>
                <td>
                  {c.ultimaCompra
                    ? `#${c.ultimaCompra.id} ${c.ultimaCompra.fecha}`
                    : "—"}
                </td>
                <td>
                  ${c.total.toLocaleString("es-AR")}
                </td>
                <td>
                  <Link to={`/admin/customers/${c.email}`} className="btn-ver-venta">
                    Ver cliente →
                  </Link>
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
