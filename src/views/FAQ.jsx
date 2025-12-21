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
      title: "📍 Pickup Point en CABA",
      img: capitalIcon,
      desc: "También contamos con un punto de retiro en Capital, en 'Aquelare showroom', a 3 cuadras de la Facultad de Medicina."
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

      {/* Sección Cambios */}
      <div className="faq__changes">
        <h2 className="faq__subtitle">Cambios</h2>
        <p className="faq__changes-text">
          El plazo máximo para realizar cambios es de 15 días a partir de la fecha de acreditación de pago y deberá presentarse el producto con el etiquetado y empaquetado original y en las condiciones adecuadas, sin signos de uso. Para eso, deberás ponerte en contacto via e-mail a <strong>hellocomfyind@gmail.com</strong> y así coordinar el envío, será necesario abonar el servicio de logística inversa correspondiente al envío desde y hacia sucursal de Correo Argentino y/o ANDREANI. El valor del producto que se tomará para poder hacer el cambio es el que hayas abonado originalmente en tu compra. 😊
          <br /><br />
          Cuando llegue el paquete, nos pondremos en contacto para gestionar el cambio del producto de acuerdo al stock disponible en el momento. Tené en cuenta que no podemos realizar cambios o devoluciones de productos que no cumplan las condiciones de higiene estipuladas en el momento de entrega, es decir presenten manchas de maquillaje, manchas de productos de aseo o higiene personal, pelos de mascotas o productos con cualquier tipo de alteración externa (ya sea modificaciones sobre prendas realizadas bajo responsabilidad total del cliente y /o prendas que presenten olores corporales, que hayan sido lavadas y/o utilizadas).
          <br /><br />
          En caso de falla de producción del producto (costuras, tejidos, coloraciones), podés solicitar un cambio dentro de los 10 días hábiles posteriores a la entrega del producto siendo los costos de envíos responsabilidad total de la marca. Una vez expirado el plazo, no se aceptan cambios, reclamos y/o devoluciones.
        </p>
      </div>

      {/* Sección Devoluciones */}
      <div className="faq__returns">
        <h2 className="faq__subtitle">Devoluciones</h2>
        <p className="faq__returns-text">
          ¿Cómo se realizan las devoluciones de las compras?
          <br /><br />
          En caso de que quieras cancelar la compra y solicitar la devolución del dinero, tenés 10 días desde la fecha de compra del producto para hacerlo. Deberás comunicarte vía e-mail a <strong>hellocomfyind@gmail.com</strong> mencionando el número de orden y motivo de la solicitud de cancelación. Una vez transcurrido el tiempo mencionado, no se podrán realizar devoluciones de ningún tipo. En cualquiera de los casos, el reintegro se hará mediante la plataforma de cobro virtual Mercado Pago o transferencia bancaria si fuere la opción elegida de pago (SIN EXCEPCIÓN).
          <br /><br />
          ⇢ Si solicitaste la opción de envío, debes enviar los productos a casa central y una vez recibidos y controlados realizaremos la devolución del dinero de los productos —siempre y cuando estén en las mismas condiciones de entrega—. El dinero de costos de envío no podrá ser reembolsado ya que es abonado a la empresa de transporte y no a Hello Comfy!.
          <br /><br />
          *Información provista por el artículo 561/99 de la Ley de Defensa del Consumidor (24.240)
        </p>
      </div>
    </section>
  );
}
