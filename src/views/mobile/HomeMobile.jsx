// HomeMobile.jsx
// Versión mobile/tablet del Home

import { useState, useEffect } from "react";
import "../../styles/mobile/home.css";
import BestSellersMobile from "../../components/mobile/BestSellersMobile";
import NewInMobile from "../../components/mobile/NewInMobile";
import FloatingBearMobile from "../../components/mobile/FloatingBearMobile";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function HomeMobile() {
  const [homeTitle, setHomeTitle] = useState("Bienvenid@ a Hello-Comfy");
  const [homeDescription, setHomeDescription] = useState("");

  useEffect(() => {
    loadHomeCopy();
    const handleUpdate = () => loadHomeCopy();
    window.addEventListener("homeCopyUpdated", handleUpdate);
    return () => window.removeEventListener("homeCopyUpdated", handleUpdate);
  }, []);

  async function loadHomeCopy() {
    try {
      const response = await fetch(`${API_URL}/api/config/home-copy`);
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
      }
    } catch (error) {
      console.error('Error cargando home copy:', error);
    }
  }

  return (
    <>
      <section className="home-copy">
        <h1>{homeTitle}</h1>
        <p>{homeDescription}</p>
        <h2 className="bestsellers__title">Los más vendidos:</h2>
        <BestSellersMobile />
        <h2 className="newin__title">Nuevos ingresos:</h2>
        <NewInMobile />
      </section>
      <FloatingBearMobile />
    </>
  );
}
