import { useEffect, useMemo, useState } from "react";
import MarketingMessage from "../MarketingMessage";
import "../../styles/mobile/promobanner.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PromoBannerMobile(props) {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/promo-banner`)
      .then(res => res.json())
      .then(data => {
        setBannerData(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const finalMessage = bannerData?.message || "Aprovechá hoy 3x2 en remeras 🧸";
  const IMGS = useMemo(() => {
    if (bannerData && bannerData.images && bannerData.images.length > 0) {
      return bannerData.images.map(img => img.url);
    }
    return [null];
  }, [bannerData]);

  return (
    <section className="promoBanner-mobile">
      <div className="promoBanner__message-mobile">
        <MarketingMessage message={finalMessage} />
      </div>
      {IMGS[0] && (
        <img src={IMGS[0]} alt="Promo Hello-Comfy" className="promoBanner__img-mobile" />
      )}
    </section>
  );
}
