import "../styles/product-size-tables.css";

export default function DynamicSizeTable({ table }) {
  if (!table || !table.sizes || !table.measurements) return null;

  return (
    <div className="size-table">
      <h3>{table.displayName}</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            {table.sizes.map((size) => (
              <th key={size}>{size}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.measurements.map((m, i) => (
            <tr key={i}>
              <td>{m.name}</td>
              {table.sizes.map((size) => {
                const values = m.values instanceof Map
                  ? Object.fromEntries(m.values)
                  : m.values || {};
                return <td key={size}>{values[size] || "-"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {table.note && <p className="note">{table.note}</p>}
    </div>
  );
}
