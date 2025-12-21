// src/views/PaymentMethods.jsx
import "../styles/paymentmethods.css";
import mpLogo from "../assets/payments/mp.png";

export default function PaymentMethods() {
  const methods = [
    {
      name: "Mercado Pago",
      img: mpLogo,
      desc: "Pagá fácil y seguro con tu cuenta de Mercado Pago."
    },
    {
      name: "Cuenta DNI",
      img: "/assets/payments/cuentadni.png",
      desc: "Aprovechá beneficios exclusivos pagando con Cuenta DNI."
    },
    {
      name: "GoCuotas",
      img: "/assets/payments/gocuotas.png",
      desc: "Financiá tus compras en cuotas sin tarjeta."
    },
    {
      name: "Transferencias Bancarias",
      img: "/assets/payments/transferencia.png",
      desc: "Realizá transferencias desde tu banco de manera directa."
    },
    {
      name: "Modo",
      img: "/assets/payments/modo.png",
      desc: "Pagá con MODO desde tu app bancaria."
    }
  ];

  return (
    <section className="paymentmethods">
      <h1>Medios de pago</h1>
      <p className="paymentmethods__intro">
        En Hello-Comfy aceptamos los siguientes métodos de pago para que elijas el que más te convenga:
      </p>

      <div className="paymentmethods__grid">
        {methods.map((m) => (
          <div key={m.name} className="paymentmethods__card">
            <img src={m.img} alt={m.name} className="paymentmethods__img" />
            <h2 className="paymentmethods__title">{m.name}</h2>
            <p className="paymentmethods__desc">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
