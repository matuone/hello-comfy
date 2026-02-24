// src/views/Home.jsx
import useResponsive from "../hooks/useResponsive";
import HomeMobile from "./mobile/HomeMobile";
import { useState, useEffect } from "react";
import BestSellers from "../components/BestSellers";
import NewIn from "../components/NewIn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function Home() {
  const { isMobile, isTablet } = useResponsive();
  const [homeTitle, setHomeTitle] = useState("Bienvenid@ a Hello-Comfy");
  const [homeDescription, setHomeDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquam accusantium porro, quidem nisi ad error quibusdam illum mollitia, magnam quasi animi, hic quis laudantium? Quisquam reprehenderit excepturi magni quasi?"
  );
  const [titleStyles, setTitleStyles] = useState({});
  const [descriptionStyles, setDescriptionStyles] = useState({});

  useEffect(() => {
    loadHomeCopy();

    // Escuchar cambios desde AdminMarketing
    const handleUpdate = () => {
      loadHomeCopy();
    };

    window.addEventListener("homeCopyUpdated", handleUpdate);

    return () => {
      window.removeEventListener("homeCopyUpdated", handleUpdate);
    };
  }, []);

  async function loadHomeCopy() {
    try {
      const response = await fetch(apiPath('/config/home-copy'));
      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Respuesta no es JSON:', text);
        return;
      }
      if (data) {
        setHomeTitle(data.title || "Bienvenid@ a Hello-Comfy");
        setHomeDescription(data.description || "");
        setTitleStyles(data.titleStyles || {});
        setDescriptionStyles(data.descriptionStyles || {});
      }
    } catch (error) {
      console.error('Error cargando home copy:', error);
    }
  }

  if (isMobile || isTablet) {
    return <HomeMobile />;
  }

  return (
    <>
      <section className="home-copy">
        <h1 style={{
          ...(titleStyles.maxWidth ? { maxWidth: `${titleStyles.maxWidth}px` } : {}),
          ...(titleStyles.fontSize ? { fontSize: `${titleStyles.fontSize}px` } : {}),
          ...(titleStyles.color ? { color: titleStyles.color } : {}),
        }}>{homeTitle}</h1>
        <p style={{
          ...(descriptionStyles.maxWidth ? { maxWidth: `${descriptionStyles.maxWidth}px` } : {}),
          ...(descriptionStyles.fontSize ? { fontSize: `${descriptionStyles.fontSize}px` } : {}),
          ...(descriptionStyles.color ? { color: descriptionStyles.color } : {}),
        }}>{homeDescription}</p>
      </section>

      <BestSellers />
      <NewIn />
    </>
  );
}
