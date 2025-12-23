// src/views/Home.jsx
import BestSellers from "../components/BestSellers";
import NewIn from "../components/NewIn";

export default function Home() {
  return (
    <>
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
