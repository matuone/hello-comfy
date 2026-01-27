import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminOpinions() {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    fetchOpinions();
  }, []);

  async function fetchOpinions() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/opinions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const sorted = (data.opinions || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOpinions(sorted);
    } catch (err) {
      setError("Error al cargar opiniones");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta opinión?")) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_URL}/opinions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpinions(opinions.filter((op) => op._id !== id));
    } finally {
      setDeleting("");
    }
  }

  return (
    <div className="admin-opinions-container">
      <h2>Opiniones de productos</h2>
      {loading ? (
        <p>Cargando opiniones...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : opinions.length === 0 ? (
        <p>No hay opiniones.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table className="admin-opinions-table" style={{ borderCollapse: 'collapse', minWidth: 900, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'left', borderRight: '1px solid #eee' }}>Fecha</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'left', borderRight: '1px solid #eee' }}>Producto</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'left', borderRight: '1px solid #eee' }}>Cliente</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center', borderRight: '1px solid #eee' }}>Estrellas</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'left', borderRight: '1px solid #eee' }}>Opinión</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {opinions.map((op, idx) => (
                <tr key={op._id} style={{ background: idx % 2 === 0 ? '#fafbfc' : '#fff', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0' }}>{new Date(op.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0', fontWeight: 500 }}>{op.product?.name || op.productName || "-"}</td>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0' }}>{op.user?.name || op.userName || "-"}</td>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0', textAlign: 'center', color: '#f5b400', fontSize: 18 }}>{"★".repeat(op.stars)}</td>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0' }}>{op.text}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(op._id)} disabled={deleting === op._id} style={{ color: "#d94f7a", border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      {deleting === op._id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
