// src/views/Home.jsx
import PromoBanner from "../components/PromoBanner";
import BestSellers from "../components/BestSellers";
import NewIn from "../components/NewIn";

export default function Home() {
  return (
    <>
      <PromoBanner
        fullBleed
        height="clamp(520px, 72vw, 880px)"
        objectPositions={["center 35%", "center top", "center 35%"]}
        autoplay
        interval={5000}
      />

      <section className="home-copy">
        <h1>Bienvenid@ a Hello-Comfy</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
          aliquam accusantium porro, quidem nisi ad error quibusdam illum
          mollitia, magnam quasi animi, hic quis laudantium? Quisquam
          reprehenderit excepturi magni quasi?
        </p>
      </section>

      <BestSellers />
      <NewIn />
    </>
  );
}
