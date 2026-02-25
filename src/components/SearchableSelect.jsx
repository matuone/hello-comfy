// src/components/SearchableSelect.jsx
import { useState, useRef, useEffect } from "react";
import "../styles/searchableselect.css";

/**
 * Select con búsqueda integrada.
 * Props:
 *   options: string[]
 *   value: string
 *   onChange: (value: string) => void
 *   placeholder: string
 *   disabled?: boolean
 */
export default function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!open) setOpen(true);
  };

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div className={`ss-container${disabled ? " ss-disabled" : ""}`} ref={containerRef}>
      {/* Botón que muestra el valor actual */}
      {!open ? (
        <div className="ss-display" onClick={handleOpen}>
          <span className={value ? "ss-value" : "ss-placeholder"}>
            {value || placeholder || "Seleccioná..."}
          </span>
          {value && (
            <button className="ss-clear" onClick={handleClear} title="Limpiar">×</button>
          )}
          <span className="ss-arrow">▾</span>
        </div>
      ) : (
        <div className="ss-input-wrap">
          <input
            ref={inputRef}
            className="ss-input"
            type="text"
            placeholder="Escribí para buscar..."
            value={search}
            onChange={handleInputChange}
            autoFocus
          />
          <span className="ss-arrow" onClick={() => { setOpen(false); setSearch(""); }}>▴</span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="ss-dropdown">
          {filtered.length === 0 ? (
            <div className="ss-no-results">Sin resultados</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                className={`ss-option${opt === value ? " ss-option--selected" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
