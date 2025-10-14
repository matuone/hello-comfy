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
        <p>Tu primera web en React está viva 🎉</p>
      </section>
    </main>
  );
}
