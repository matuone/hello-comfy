import { useEffect, useRef, useState } from "react";

const LS_KEY = "hello-comfy:newsletter:hiddenUntil"; // guarda timestamp

export default function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const emailRef = useRef(null);
  const dialogRef = useRef(null);

  // abrir si no está oculto por tiempo
  useEffect(() => {
    const hiddenUntil = Number(localStorage.getItem(LS_KEY) || 0);
    if (Date.now() > hiddenUntil) {
      const t = setTimeout(() => setOpen(true), 1000); // abre a 1s
      return () => clearTimeout(t);
    }
  }, []);

  // cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  const snoozeDays = 7; // cambiar si querés
  const hideForDays = () =>
    localStorage.setItem(LS_KEY, String(Date.now() + snoozeDays * 24 * 60 * 60 * 1000));

  const handleClose = () => {
    hideForDays();
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    // TODO: acá enviar a tu backend o servicio de email (Brevo, Mailchimp, etc.)
    console.log("Newsletter email:", email);
    hideForDays();
    setOpen(false);
    alert("¡Gracias por suscribirte! Tenés 5% de descuento 🎉");
  };

  if (!open) return null;

  return (
    <div
      aria-hidden={!open}
      style={backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose(); // click fuera cierra
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-title"
        style={card}
      >
        <button onClick={handleClose} aria-label="Cerrar" style={closeBtn}>×</button>

        <h2 id="nl-title" style={{ fontSize: 20, marginBottom: 8 }}>
          Suscribite al newsletter
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 14 }}>
          ¡Obtené <strong>5% de descuento</strong> en tu próxima compra!
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            ref={emailRef}
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            style={input}
          />
          <button type="submit" style={button}>Suscribirme</button>
        </form>

        <label style={finePrint}>
          <input type="checkbox" onChange={handleClose} /> No mostrar por 7 días
        </label>
      </section>
    </div>
  );
}

/* estilos inline minimalistas */
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.3)",
  display: "grid",
  placeItems: "center",
  zIndex: 50,
};

const card = {
  position: "relative",
  width: "min(520px, 92vw)",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,.10)",
};

const input = {
  flex: 1,
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  outline: "none",
};

const button = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#ff8ac4",
  fontWeight: 700,
  cursor: "pointer",
};

const closeBtn = {
  position: "absolute",
  right: 10,
  top: 8,
  border: "none",
  background: "transparent",
  fontSize: 24,
  cursor: "pointer",
  lineHeight: 1,
};

const finePrint = { display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "#6b7280" };
