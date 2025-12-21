// src/views/PaymentMethods.jsx
import { useState } from "react";
import "../styles/paymentmethods.css";

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
      desc: "Pagá fácil y seguro con tu cuenta de Mercado Pago.",
      details: "Mercado Pago te permite pagar con tarjeta, débito o saldo en tu cuenta de forma rápida y segura."
    },
    {
      name: "Cuenta DNI",
      img: dniLogo,
      desc: "Aprovechá beneficios exclusivos pagando con Cuenta DNI.",
      details: "Cuenta DNI ofrece promociones y descuentos exclusivos en comercios adheridos, además de pagos simples desde tu celular. Una vez realizada la compra se enviara por email el codigo QR para poder abonar."
    },
    {
      name: "GoCuotas",
      img: gocuotasLogo,
      desc: "Financiá tus compras en cuotas sin tarjeta.",
      details: "Con GoCuotas podés dividir tus compras en cuotas fijas sin necesidad de tarjeta de crédito."
    },
    {
      name: "Transferencias Bancarias",
      img: transferenciaLogo,
      desc: "Realizá transferencias desde tu banco de manera directa.",
      details: "Podés transferir el monto de tu compra directamente desde tu cuenta bancaria a la nuestra."
    },
    {
      name: "Modo",
      img: modoLogo,
      desc: "Pagá con MODO desde tu app bancaria.",
      details: "MODO te permite pagar con tu banco de forma digital, rápida y segura, sin necesidad de tarjeta física."
    }
  ];

  const [selectedMethod, setSelectedMethod] = useState(null);

  return (
    <section className="paymentmethods">
      <h1>Medios de pago</h1>
      <p className="paymentmethods__intro">
        En Hello-Comfy aceptamos los siguientes métodos de pago para que elijas el que más te convenga:
      </p>

      <div className="paymentmethods__grid">
        {methods.map((m) => (
          <div
            key={m.name}
            className="paymentmethods__card"
            onClick={() => setSelectedMethod(m)}
          >
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

      {/* Popup Modal */}
      {selectedMethod && (
        <div
          className="paymentmethods__modal"
          onClick={() => setSelectedMethod(null)}   // 👈 click en fondo cierra
        >
          <div
            className="paymentmethods__modal-content"
            onClick={(e) => e.stopPropagation()}    // 👈 evita cierre al click interno
          >
            <span
              className="paymentmethods__modal-close"
              onClick={() => setSelectedMethod(null)}
            >
              &times;
            </span>
            <img
              src={selectedMethod.img}
              alt={selectedMethod.name}
              className="paymentmethods__modal-logo"
            />
            <h2 className="paymentmethods__modal-title">{selectedMethod.name}</h2>
            <p className="paymentmethods__modal-desc">{selectedMethod.details}</p>
          </div>
        </div>
      )}
    </section>
  );
}
