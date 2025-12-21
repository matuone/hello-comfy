// src/views/FAQ.jsx
import "../styles/faq.css";

// 👇 Importamos los íconos desde src/assets/shippings
import correoArgentinoIcon from "../assets/shippings/correoargentino.png";
import andreaniIcon from "../assets/shippings/andreani.png";
import uberIcon from "../assets/shippings/uber.png";
import temperleyIcon from "../assets/shippings/temperley.png";
import capitalIcon from "../assets/shippings/capital.png";

export default function FAQ() {
  const faqs = [
    {
      title: "📦 Envíos por Correo Argentino",
      img: correoArgentinoIcon,
      extraClass: "faq__img--correo",
      desc: "Realizamos envíos a través de Correo Argentino con fechas estimativas de entrega según tu localidad."
    },
    {
      title: "🚚 Envíos por Andreani",
      img: andreaniIcon,
      extraClass: "faq__img--andreani",
      desc: "También contamos con envíos mediante Andreani, con tiempos estimativos de entrega similares a Correo Argentino."
    },
    {
      title: "🚗 Envíos por Uber (Zona Sur y CABA)",
      img: uberIcon,
      desc: "Ofrecemos envíos rápidos por Uber en Zona Sur del Gran Buenos Aires y CABA, con una demora de 24 horas en despachar tu pedido."
    },
    {
      title: "📍 Pickup Point en Temperley",
      img: temperleyIcon,
      desc: "Podés retirar tu compra en nuestro punto de retiro en Temperley, cerca de Av. Almirante Brown al 4200."
    },
    {
      title: "📍 Pickup Point en Capital",
      img: capitalIcon,
      desc: "También contamos con un punto de retiro en Capital, en 'Aquellare', a 3 cuadras de la Facultad de Medicina."
    }
  ];

  return (
    <section className="faq">
      <h1>Envíos y retiros</h1>
      <div className="faq__grid">
        {faqs.map((f) => (
          <div key={f.title} className="faq__card">
            <div className="faq__iconbubble">
              <img
                src={f.img}
                alt={f.title}
                className={`faq__img ${f.extraClass || ""}`}
              />
            </div>
            <h2 className="faq__title">{f.title}</h2>
            <p className="faq__desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Sección adicional debajo de las burbujas */}
      <h2 className="faq__subtitle">Cambios o devoluciones</h2>
      <p className="faq__desc">
        Si necesitás realizar un cambio o devolución, podés coordinarlo con
        nuestro equipo de atención al cliente. Nos aseguramos de que el proceso
        sea simple y rápido para tu comodidad.
      </p>
    </section>
  );
}
