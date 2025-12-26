import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../styles/adminsaledetail.css";

export default function AdminSaleDetail() {
  const { id } = useParams();

  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const appsRef = useRef(null);
  const moreRef = useRef(null);

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

  // ============================================
  // DATOS DE EJEMPLO (sin backend)
  // ============================================
  const venta = {
    id,
    fecha: "23/12/2025 15:10",
    cliente: "Camila Cabrera Iglesias",
    email: "cabreracamila@gmail.com",
    telefono: "+54 9 11 6937 0079",
    dni: "41.558.809",

    comentarios: "La remera de Snoopy es para regalo",

    producto: {
      nombre: "Buzo oversize beige THE PERFECT FRIEND X SNOOPY",
      talle: "XL",
      precio: "$59.850,00",
      descuento: "-$5.985,00",
      envio: "$6.496,74",
      total: "$60.361,74",
    },

    direccion: {
      calle: "Chacabuco",
      numero: "915",
      piso: "1J",
      barrio: "San Telmo",
      cp: "1069",
      ciudad: "Capital Federal",
      provincia: "Capital Federal",
      pais: "Argentina",
    },

    envio: {
      metodo: "andreani", // 👈 AHORA USAMOS LOS NUEVOS VALORES
      demora: "4 a 5 días hábiles",
      peso: "0.1 kg",
      seguimiento: "360002840905880",
    },

    historial: [
      { fecha: "24/12 10:55", evento: "Código de seguimiento agregado" },
      { fecha: "24/12 10:55", evento: "Paquete enviado" },
      { fecha: "24/12 10:55", evento: "Paquete empaquetado" },
      { fecha: "23/12 15:14", evento: "Pago marcado como recibido" },
    ],
  };

  // ============================================
  // RENDER DEL MÉTODO DE ENVÍO
  // ============================================
  function renderMetodo(m) {
    switch (m) {
      case "andreani":
        return "📦 Andreani";
      case "correo":
        return "✉️ Correo Argentino";
      case "retiro_temperley":
        return "🏬 Retiro en Temperley";
      case "retiro_aquelarre":
        return "🏬 Retiro en Aquelarre";
      default:
        return m;
    }
  }

  function copiarSeguimiento() {
    navigator.clipboard.writeText(venta.envio.seguimiento);
    alert("Código copiado al portapapeles");
  }

  function toggleApps() {
    setIsAppsOpen((prev) => !prev);
    setIsMoreOpen(false);
  }

  function toggleMore() {
    setIsMoreOpen((prev) => !prev);
    setIsAppsOpen(false);
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Venta {venta.id}</h2>
      <p className="admin-section-text">Detalle completo de la venta.</p>

      {/* ============================
          BOTONES DE ACCIÓN
      ============================ */}
      <div className="detalle-actions">

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

        <div className="detalle-box">
          <h3 className="detalle-title">Producto</h3>
          <p className="detalle-info-line"><strong>Nombre:</strong> {venta.producto.nombre}</p>
          <p className="detalle-info-line"><strong>Talle:</strong> {venta.producto.talle}</p>
          <p className="detalle-info-line"><strong>Precio:</strong> {venta.producto.precio}</p>
          <p className="detalle-info-line"><strong>Descuento:</strong> {venta.producto.descuento}</p>
          <p className="detalle-info-line"><strong>Envío:</strong> {venta.producto.envio}</p>
          <p className="detalle-info-line"><strong>Total pagado:</strong> {venta.producto.total}</p>
        </div>

        <div className="detalle-box">
          <h3 className="detalle-title">Cliente</h3>
          <p className="detalle-info-line"><strong>Nombre:</strong> {venta.cliente}</p>
          <p className="detalle-info-line"><strong>Email:</strong> {venta.email}</p>
          <p className="detalle-info-line"><strong>Teléfono:</strong> {venta.telefono}</p>
          <p className="detalle-info-line"><strong>DNI/CUIT:</strong> {venta.dni}</p>
        </div>

        <div className="detalle-box">
          <h3 className="detalle-title">Dirección</h3>
          <p className="detalle-info-line">{venta.direccion.calle} {venta.direccion.numero}, Piso {venta.direccion.piso}</p>
          <p className="detalle-info-line">{venta.direccion.barrio}</p>
          <p className="detalle-info-line">CP {venta.direccion.cp}</p>
          <p className="detalle-info-line">{venta.direccion.ciudad}, {venta.direccion.provincia}</p>
          <p className="detalle-info-line">{venta.direccion.pais}</p>
        </div>

        <div className="detalle-box">
          <h3 className="detalle-title">Envío</h3>

          {/* 👇 ACÁ SE USA EL NUEVO RENDER */}
          <p className="detalle-info-line">
            <strong>Método:</strong> {renderMetodo(venta.envio.metodo)}
          </p>

          <p className="detalle-info-line"><strong>Demora estimada:</strong> {venta.envio.demora}</p>
          <p className="detalle-info-line"><strong>Peso:</strong> {venta.envio.peso}</p>
          <p className="detalle-info-line"><strong>Código de seguimiento:</strong> {venta.envio.seguimiento}</p>

          <button className="detalle-copy-btn" onClick={copiarSeguimiento}>
            Copiar código
          </button>
        </div>

      </div>

      {/* ============================
          HISTORIAL
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Historial</h3>
        <ul className="detalle-historial">
          {venta.historial.map((item, index) => (
            <li key={index}>
              <strong>{item.fecha}:</strong> {item.evento}
            </li>
          ))}
        </ul>
      </div>

      {/* ============================
          COMENTARIOS DEL CLIENTE
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Comentarios del cliente</h3>

        {venta.comentarios && venta.comentarios.trim() !== "" ? (
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
