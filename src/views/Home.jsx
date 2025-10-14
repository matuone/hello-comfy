import banner from "../assets/banner.png";

export default function Home() {
  return (
    <main>
      {/* HERO / BANNER a todo ancho */}
      <section className="full-banner">
        <img src={banner} alt="Hello Comfy - Prendas 100% algodón" />
      </section>

      {/* Contenido */}
      <section className="home-copy" style={{ textAlign: "center", padding: "40px 16px" }}>
        <h1>Bienvenid@ a Hello-Comfy</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquam accusantium porro, quidem nisi ad error quibusdam illum mollitia, magnam quasi animi, hic quis laudantium? Quisquam reprehenderit excepturi magni quasi?</p>
      </section>
    </main>
  );
}
