import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/instagramfeed.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";
function apiPath(path) {
  return `${API_URL}${path}`;
}

export default function InstagramFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortByNewest = (posts) => {
    if (!Array.isArray(posts)) return [];
    return [...posts].sort((a, b) => {
      const aDate = new Date(a?.timestamp || a?.createdAt || 0);
      const bDate = new Date(b?.timestamp || b?.createdAt || 0);
      return bDate - aDate;
    });
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      setLoading(true);
      // Intentar feed en tiempo real para priorizar los últimos posteos.
      const realtimeResponse = await fetch(apiPath("/instagram/feed?limit=12"));
      if (realtimeResponse.ok) {
        const realtimeData = await realtimeResponse.json();
        setFeed(sortByNewest(realtimeData));
        setError(null);
        return;
      }

      // Fallback: feed de DB sincronizado.
      const dbResponse = await fetch(apiPath("/feed"));
      if (!dbResponse.ok) {
        throw new Error("Error al cargar el feed");
      }
      const dbData = await dbResponse.json();
      setFeed(sortByNewest(dbData));
      setError(null);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(null);
      setFeed([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="instagram-feed-container">
        <div className="feed-loading">
          <p>Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="instagram-feed-container">
        <div className="feed-empty">
          <p>📸 Sigue nuestro Instagram para las últimas novedades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-feed-container">
      <div className="feed-header">
        <p>SEGUINOS EN INSTAGRAM — <a href="https://www.instagram.com/itscomfy.ind/" target="_blank" rel="noopener noreferrer">@ITSCOMFY.IND</a></p>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          480: {
            slidesPerView: 1.5,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 2.5,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
        className="instagram-swiper"
      >
        {feed.map((post) => (
          <SwiperSlide key={post._id || post.id} className="swiper-slide-custom">
            <a
              href={post.instagramUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="feed-item-link"
              title={post.title}
            >
              <div className="feed-item">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="feed-image"
                  loading="lazy"
                />
                <div className="feed-overlay">
                  <div className="feed-caption">{post.title || post.caption}</div>
                  <div className="feed-instagram-badge">
                    <span>Ver en Instagram →</span>
                  </div>
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
