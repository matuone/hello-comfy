// src/views/Home.jsx
import { useState, useEffect } from "react";
import BestSellers from "../components/BestSellers";
import NewIn from "../components/NewIn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Home() {
  const [homeTitle, setHomeTitle] = useState("Bienvenid@ a Hello-Comfy");
  const [homeDescription, setHomeDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquam accusantium porro, quidem nisi ad error quibusdam illum mollitia, magnam quasi animi, hic quis laudantium? Quisquam reprehenderit excepturi magni quasi?"
  );

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
      const response = await fetch(`${API_URL}/site-config/home-copy`);
      const data = await response.json();

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
      </section>

      <BestSellers />
      <NewIn />
    </>
  );
}
