import { useEffect, useState } from "react";
import MarketingMessage from "../MarketingMessage";
import "../../styles/promobanner.tablet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function PromoBannerTablet(props) {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiPath('/promo-banner'))
      .then(res => res.json())
      .then(data => {
        setBannerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando banner:', err);
        setLoading(false);
      });
  }, []);

  var savedMessage = localStorage.getItem("promoMessage");
  var backendMessage = bannerData?.message;
  var finalMessage = backendMessage || savedMessage || "Aprovechá hoy 3x2 en remeras 🧸";

  if (loading) return null;

  return (
    <section className="promoBannerTablet">
      <div className="promoBannerTablet__message">
        <MarketingMessage message={finalMessage} />
      </div>
      {/* Aquí puedes agregar un slider o imagen para tablet si lo deseas */}
    </section>
  );
}
