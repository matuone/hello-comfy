import { Link } from "react-router-dom";

export default function PromoBanner({
  imgSrc = "",                     // URL de la imagen de fondo
  title = "HEY! SÉ PARTE DE",
  highlight = "Friends Club",
  subtitle = "Descubrí nuestro programa de membresía. Obtené puntos y accedé a beneficios increíbles.",
  ctaText = "Unirme ahora",
  ctaTo = "/",
  showRibbon = true,               // cinta diagonal tipo “Friends Club”
  ribbonText = "Friends Club",
}) {
  return (
    <section className="promo-banner" aria-label="Promoción principal">
      <div className="promo-bg" aria-hidden="true">
        {/* Si no hay imagen aún, queda un degradé lindo */}
        {imgSrc ? <img src={imgSrc} alt="" /> : <div className="promo-placeholder" />}
        <div className="promo-overlay" />
      </div>

      <div className="promo-content">
        <p className="promo-kicker">{title}</p>
        <h2 className="promo-title">
          <span className="promo-title-main">{highlight}</span>
        </h2>
        <p className="promo-subtitle">{subtitle}</p>
        <Link className="promo-cta" to={ctaTo}>{ctaText}</Link>
      </div>

      {showRibbon && (
        <div className="promo-ribbon">
          <span>{ribbonText}</span>
        </div>
      )}
    </section>
  );
}
