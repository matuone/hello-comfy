// src/components/NewsletterModal.jsx
import { useEffect, useState } from "react";
import "../styles/newsletter-modal.css";

const STORAGE_KEY = "hc_newsletter_seen";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Mostrar el popup solo si el usuario no lo cerró antes
  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(STORAGE_KEY);

    if (!alreadySeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // aparece a los 3 segundos

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Guardamos que ya lo vio para no molestarlo siempre
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    if (!email || typeof email !== "string") {
      return;
    }

    // Por ahora solo hacemos un alert / console.log simulando el envío
    // En el futuro lo conectamos a tu backend o a un servicio de email.
    console.log("Nuevo email suscripto:", email);
    alert("¡Gracias por suscribirte! Tenés 5% de descuento ✨");

    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="newsletter-overlay" onClick={handleClose}>
      <div
        className="newsletter-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="newsletter-close"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2 className="newsletter-title">Suscribite a nuestro newsletter</h2>
        <p className="newsletter-text">
          Unite a la familia Hello Comfy y obtené un{" "}
          <strong>5% de descuento</strong> en tu primera compra.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            required
            placeholder="Tu email"
            className="newsletter-input"
          />
          <button type="submit" className="newsletter-button">
            Quiero mi 5% OFF
          </button>
        </form>

        <p className="newsletter-small">
          No hacemos spam, solo comfy vibes 🧸
        </p>
      </div>
    </div>
  );
}
