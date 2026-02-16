// src/components/Footer.jsx
import InstagramFeed from "./InstagramFeed";

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        {/* Instagram Feed personalizado */}
        <InstagramFeed />
        <div className="footer-divider"></div>
        <p>© 2025 Hello-Comfy</p>
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "1rem" }}>
          Desarrollado por <strong>Matias Castells</strong>, Full Stack Developer (UTN).
          <br />
          <a
            href="https://www.linkedin.com/in/matias-castells-353403262/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#0A66C2", textDecoration: "none", fontWeight: 500 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle" }}>
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
