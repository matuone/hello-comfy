import { useState, useEffect, useContext } from "react";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

import Step1 from "./CheckoutStep1";
import Step2 from "./CheckoutStep2";
import Step3 from "./CheckoutStep3";
import Step4 from "./CheckoutStep4";


import "../styles/checkout.css";

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const { user } = useContext(AuthContext);

  // Recuperar estado desde localStorage o usar valores por defecto
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("checkoutStep");
    return saved ? parseInt(saved) : 1;
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("checkoutFormData");
    return saved ? JSON.parse(saved) : {
      name: "",
      dni: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      province: "",
      localidad: "",
      shippingMethod: "",
      pickPoint: "",
      paymentMethod: "",
      paymentProof: "",
      paymentProofName: "",
      notes: "",
      isGift: false,
      giftMessage: "",
    };
  });

  // Pre-cargar email del usuario logueado
  useEffect(() => {
    if (user && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Guardar estado en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("checkoutStep", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  // Función para limpiar el checkout (llamar después de pago exitoso)
  const clearCheckout = () => {
    localStorage.removeItem("checkoutStep");
    localStorage.removeItem("checkoutFormData");
    setStep(1);
    setFormData({
      name: "",
      dni: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      province: "",
      localidad: "",
      shippingMethod: "",
      pickPoint: "",
      paymentMethod: "",
      paymentProof: "",
      paymentProofName: "",
      notes: "",
      isGift: false,
      giftMessage: "",
    });
  };

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Finalizar compra</h1>

      <div className="checkout-steps">
        <div className={`step ${step === 1 ? "active" : ""}`}>1</div>
        <div className={`step ${step === 2 ? "active" : ""}`}>2</div>
        <div className={`step ${step === 3 ? "active" : ""}`}>3</div>
        <div className={`step ${step === 4 ? "active" : ""}`}>4</div>
      </div>

      {step === 1 && (
        <Step1 formData={formData} updateField={updateField} next={next} />
      )}

      {step === 2 && (
        <Step2
          formData={formData}
          updateField={updateField}
          next={next}
          back={back}
        />
      )}

      {step === 3 && (
        <Step3
          formData={formData}
          updateField={updateField}
          next={next}
          back={back}
        />
      )}

      {step === 4 && (
        <Step4
          formData={formData}
          items={items}
          totalPrice={totalPrice}
          back={back}
          clearCheckout={clearCheckout}
        />
      )}
    </div>
  );
}
