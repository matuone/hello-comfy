import { useState } from "react";
import { crearPreferenciaMercadoPago, redirigirAMercadoPago } from "../services/mercadopagoService";
import { toast } from "react-hot-toast";

export default function Step4({ formData, items, totalPrice, back }) {
  const [loadingPayment, setLoadingPayment] = useState(false);

  // ⭐ NUEVO — Pagar con Mercado Pago desde checkout (COMPRA REAL)
  const handlePagar = async () => {
    if (!formData.paymentMethod) {
      toast.error("Seleccioná un método de pago");
      return;
    }

    if (!formData.email) {
      toast.error("Email requerido");
      return;
    }

    setLoadingPayment(true);

    try {
      // Validar y mapear items correctamente
      const itemsValidos = items.map((item) => {
        if (!item.price || item.price <= 0) {
          console.warn("⚠️ Item con precio inválido:", item);
        }
        return {
          title: item.name || "Producto",
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.price) || 0,
          picture_url: item.image || "",
          description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
        };
      });

      console.log("📦 Items para enviar:", itemsValidos);

      const preferencia = await crearPreferenciaMercadoPago({
        items: itemsValidos,
        totalPrice: parseFloat(totalPrice) || 0,
        customerData: {
          email: formData.email,
          name: formData.name || "Cliente",
          phone: formData.phone || "",
          postalCode: formData.postalCode || "",
        },
        metadata: {
          orderType: "checkout",
          shippingMethod: formData.shippingMethod,
          shippingAddress: formData.address,
          shippingPickPoint: formData.pickPoint,
          province: formData.province,
          postalCode: formData.postalCode,
        },
      });

      if (preferencia?.init_point) {
        // Guardar datos completos de la orden en localStorage antes de redirigir a Mercado Pago
        localStorage.setItem("pendingOrder", JSON.stringify({
          formData,
          items,
          totalPrice,
          createdAt: new Date().toISOString(),
        }));
        redirigirAMercadoPago(preferencia.init_point);
      } else {
        toast.error("Error al crear la preferencia de pago");
      }
    } catch (error) {
      console.error("Error en Mercado Pago:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoadingPayment(false);
    }
  };

  const shippingLabel =
    formData.shippingMethod === "pickup"
      ? "Retiro en Pick Up Point"
      : "Envío a domicilio";

  const paymentLabel =
    formData.paymentMethod === "transfer"
      ? "Transferencia bancaria (10% OFF)"
      : "Tarjeta de débito / crédito";

  return (
    <div className="checkout-step">
      <h2>Revisión final</h2>

      <div className="review-box">
        {/* ============================
            DATOS DEL CLIENTE
        ============================ */}
        <h3>Datos del cliente</h3>
        <p><strong>Nombre:</strong> {formData.name}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Teléfono:</strong> {formData.phone}</p>

        {/* ============================
            ENVÍO
        ============================ */}
        <h3>Envío</h3>
        <p><strong>Método:</strong> {shippingLabel}</p>

        {formData.shippingMethod === "home" && (
          <>
            <p><strong>Dirección:</strong> {formData.address}</p>
            <p><strong>Código postal:</strong> {formData.postalCode}</p>
            <p><strong>Provincia:</strong> {formData.province}</p>
          </>
        )}

        {formData.shippingMethod === "pickup" && (
          <p>
            <strong>Punto de retiro:</strong>{" "}
            {formData.pickPoint === "aquelarre"
              ? "Aquelarre — CABA"
              : formData.pickPoint === "temperley"
                ? "Temperley — ZS-GBA"
                : "No seleccionado"}
          </p>
        )}

        {/* ============================
            PAGO
        ============================ */}
        <h3>Pago</h3>
        <p>{paymentLabel}</p>

        {/* ============================
            PRODUCTOS
        ============================ */}
        <h3>Productos</h3>
        {items.map((item) => (
          <p key={item.key}>
            {item.name} x{item.quantity}
          </p>
        ))}

        {/* ============================
            TOTAL
        ============================ */}
        <h3>Total</h3>
        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          ${totalPrice.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>

        {/* ⭐ NUEVO — Botón de Pago (Mercado Pago) */}
        <button
          className="checkout-btn-mercadopago"
          onClick={handlePagar}
          disabled={loadingPayment}
        >
          {loadingPayment ? "Procesando..." : "Pagar"}
        </button>
      </div>
    </div>
  );
}
