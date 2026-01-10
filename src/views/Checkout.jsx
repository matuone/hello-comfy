import { useState } from "react";
import { useCart } from "../context/CartContext";

import Step1 from "./CheckoutStep1";
import Step2 from "./CheckoutStep2";
import Step3 from "./CheckoutStep3";
import Step4 from "./CheckoutStep4";


import "../styles/checkout.css";

export default function Checkout() {
  const { items, totalPrice } = useCart();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    province: "",
    shippingMethod: "",
    pickPoint: "",       // ⭐ agregado para Pick Up Point
    paymentMethod: "",
    notes: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

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
        />
      )}
    </div>
  );
}
