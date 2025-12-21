// src/views/PaymentMethods.jsx
import "../styles/paymentmethods.css";

// 👇 Importamos todos los logos desde src/assets/payments
import mpLogo from "../assets/payments/mp.png";
import dniLogo from "../assets/payments/cuentadni.png";
import gocuotasLogo from "../assets/payments/gocuotas.png";
import transferenciaLogo from "../assets/payments/transferencia.png";
import modoLogo from "../assets/payments/modo.png";

export default function PaymentMethods() {
  const methods = [
    {
      name: "Mercado Pago",
      img: mpLogo,
      desc: "Pagá fácil y seguro con tu cuenta de Mercado Pago."
    },
    {
      name: "Cuenta DNI",
      img: dniLogo,
      desc: "Aprovechá beneficios exclusivos pagando con Cuenta DNI."
    },
    {
      name: "GoCuotas",
      img: gocuotasLogo,
      desc: "Financiá tus compras en cuotas sin tarjeta."
    },
    {
      name: "Transferencias Bancarias",
      img: transferenciaLogo,
      desc: "Realizá transferencias desde tu banco de manera directa."
    },
    {
      name: "Modo",
      img: modoLogo,
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
            <div className="paymentmethods__imgbox">
              <img
                src={m.img}
                alt={m.name}
                className={`paymentmethods__img ${m.name === "Mercado Pago" ? "paymentmethods__img--mp" : ""
                  } ${m.name === "Transferencias Bancarias" ? "paymentmethods__img--transfer" : ""}`}
              />
            </div>
            <h2 className="paymentmethods__title">{m.name}</h2>
            <p className="paymentmethods__desc">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
