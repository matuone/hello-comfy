// src/components/CottonCare.jsx
import "../styles/cottoncare.css";
import bearLaundry from "../assets/bear-laundry.png";

export default function CottonCare() {
  return (
    <section className="cotton-care">
      <div className="cotton-care-wrap">
        {/* Texto centrado respecto al viewport/nav */}
        <div className="cotton-care-text">
          <h2>Algodón y sus cuidados 🫧</h2>
          <h3>AHORA SÍ, BIENVENIDX AL HELLO COMFY! TEAM</h3>

          <p>
            Acá te vamos a explicar cómo cuidar tus prendas de algodón, para que puedas utilizarlas por mucho, mucho tiempo.
          </p>

          <p>
            Para poder exprimir la vida útil de la fibra es muy importante tener en cuenta cómo la lavamos y secamos. En <strong>HELLO COMFY!</strong> trabajamos con textiles <strong>100% algodón</strong>, de industria nacional y primerísima calidad.
          </p>

          <h4>¿Cómo debes cuidarlo?</h4>
          <ul>
            <li>Lavar a mano o en lavarropas con agua fría únicamente, para evitar que la prenda se achique.</li>
            <li>Secar al aire libre, evitando el uso de secadoras.</li>
            <li>No planchar sobre la estampa.</li>
            <li>Evitar usar lavandina o blanqueadores, ya que estos productos percuden a las fibras.</li>
            <li>Disfrutar mucho de tu prenda :)</li>
          </ul>
        </div>

        {/* Oso independiente, no participa del flujo del texto */}
        <aside className="cotton-care-bear">
          <img src={bearLaundry} alt="Osito lavando ropa con burbujas" />
        </aside>
      </div>
    </section>
  );
}
