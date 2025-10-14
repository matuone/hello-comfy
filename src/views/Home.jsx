// src/views/Home.jsx
import PromoBanner from "../components/PromoBanner";

export default function Home() {
  return (
    <main>
      {/* HERO / BANNER full-bleed y alto mayor */}
      <PromoBanner
        fullBleed
        height="clamp(520px, 72vw, 880px)"
        objectPositions={["center 35%", "center 40%", "center 35%"]}
        autoplay
        interval={5000}
      />

      {/* Contenido del home */}
      <section className="home-copy" style={{ textAlign: "center", padding: "40px 16px" }}>
        <h1>Bienvenid@ a Hello-Comfy</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquam accusantium porro,
          quidem nisi ad error quibusdam illum mollitia, magnam quasi animi, hic quis laudantium?
          Quisquam reprehenderit excepturi magni quasi?
        </p>
      </section>
    </main>
  );
}
