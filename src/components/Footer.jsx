// src/components/Footer.jsx
import { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    // Cargar el script de Elfsight solo si no está ya presente
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        {/* Elfsight Instagram Feed */}
        <div className="elfsight-app-fc1e95e6-751c-428f-9cd7-de55cba26d02" data-elfsight-app-lazy></div>
        <p>© 2025 Hello-Comfy</p>
      </div>
    </footer>
  );
}
