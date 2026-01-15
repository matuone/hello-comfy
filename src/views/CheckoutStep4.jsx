import { useState } from "react";
import { crearPreferenciaMercadoPago, redirigirAMercadoPago } from "../services/mercadopagoService";
import { createGocuotasCheckout } from "../services/gocuotasService";
import { crearIntencionPagoModo } from "../services/modoService";
import { toast } from "react-hot-toast";

export default function Step4({ formData, items, totalPrice, back }) {
  const [loadingPayment, setLoadingPayment] = useState(false);

  // ⭐ Pagar con Go Cuotas
  const handlePagarGoCuotas = async () => {
    if (!formData.email) {
      toast.error("Email requerido");
      return;
    }

    if (!formData.phone) {
      toast.error("Teléfono requerido");
      return;
    }

    setLoadingPayment(true);

    try {
      const itemsValidos = items.map((item) => ({
        title: item.name || "Producto",
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        picture_url: item.image || "",
        description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
      }));

      const dniMatch = formData.phone.match(/\d{7,8}/);
      const dni = dniMatch ? dniMatch[0] : "0000000";

      const checkout = await createGocuotasCheckout({
        items: itemsValidos,
        totalPrice: parseFloat(totalPrice) || 0,
        customerData: {
          email: formData.email,
          name: formData.name || "Cliente",
          phone: formData.phone || "",
          dni: dni,
          postalCode: formData.postalCode || "",
        },
        metadata: {
          orderType: "checkout",
          shippingMethod: formData.shippingMethod,
        },
      });

      if (checkout?.url_init) {
        localStorage.setItem("pendingOrder", JSON.stringify({
          formData,
          items,
          totalPrice,
          createdAt: new Date().toISOString(),
        }));
        window.location.href = checkout.url_init;
      } else {
        toast.error("Error al crear el checkout de Go Cuotas");
      }
    } catch (error) {
      console.error("Error en Go Cuotas:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoadingPayment(false);
    }
  };

  // ⭐ Pagar con Modo
  const handlePagarModo = async () => {
    if (!formData.email) {
      toast.error("Email requerido");
      return;
    }

    setLoadingPayment(true);

    try {
      const itemsValidos = items.map((item) => ({
        productId: item.id,
        title: item.name || "Producto",
        description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
        picture_url: item.image || "",
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        size: item.size,
        color: item.color
      }));

      const resultado = await crearIntencionPagoModo({
        items: itemsValidos,
        totalPrice: parseFloat(totalPrice) || 0,
        customerData: {
          email: formData.email,
          name: formData.name || "Cliente",
          phone: formData.phone || "",
          address: formData.address || "",
          city: formData.city || "",
          postalCode: formData.postalCode || "",
          province: formData.province || "",
          dni: formData.dni || ""
        },
        metadata: {
          orderType: "checkout",
          shippingMethod: formData.shippingMethod,
        },
      });

      if (resultado?.paymentIntent) {
        localStorage.setItem("pendingOrder", JSON.stringify({
          formData,
          items,
          totalPrice,
          paymentMethod: "modo",
          orderCode: resultado.orderCode,
          createdAt: new Date().toISOString(),
        }));

        // Redirigir a página de checkout de Modo
        window.location.href = resultado.paymentIntent.checkout_url;
      } else {
        toast.error("Error al crear el pago con Modo");
      }
    } catch (error) {
      console.error("Error en Modo:", error);
      toast.error("Error al procesar el pago con Modo");
    } finally {
      setLoadingPayment(false);
    }
  };

  // ⭐ Pagar con Mercado Pago
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
      const itemsValidos = items.map((item) => ({
        title: item.name || "Producto",
        description: item.description || "",
        picture_url: item.image || "",
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        currency_id: "ARS",
      }));

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
        },
      });

      if (preferencia?.init_point) {
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
      : formData.paymentMethod === "mercadopago"
        ? "Mercado Pago"
        : formData.paymentMethod === "gocuotas"
          ? "Go Cuotas - Financiación"
          : formData.paymentMethod === "modo"
            ? "Modo - Pago digital"
            : "Método de pago";

  return (
    <div className="checkout-step">
      <h2>Revisión final</h2>

      <div className="review-box">
        <h3>Datos del cliente</h3>
        <p><strong>Nombre:</strong> {formData.name}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Teléfono:</strong> {formData.phone}</p>

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

        <h3>Pago</h3>
        <p>{paymentLabel}</p>

        <h3>Productos</h3>
        {items.map((item) => (
          <p key={item.key}>
            {item.name} x{item.quantity}
          </p>
        ))}

        <h3>Total</h3>
        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          ${totalPrice.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>

        {formData.paymentMethod === "mercadopago" && (
          <button
            className="checkout-btn-mercadopago"
            onClick={handlePagar}
            disabled={loadingPayment}
          >
            {loadingPayment ? "Procesando..." : "Pagar con Mercado Pago"}
          </button>
        )}

        {formData.paymentMethod === "gocuotas" && (
          <button
            className="checkout-btn-gocuotas"
            onClick={handlePagarGoCuotas}
            disabled={loadingPayment}
          >
            {loadingPayment ? "Procesando..." : "Financiar con Go Cuotas"}
          </button>
        )}

        {formData.paymentMethod === "modo" && (
          <button
            className="checkout-btn-modo"
            onClick={handlePagarModo}
            disabled={loadingPayment}
          >
            {loadingPayment ? "Procesando..." : "Pagar con Modo"}
          </button>
        )}

        {formData.paymentMethod === "transfer" && (
          <button
            className="checkout-btn-transfer"
            disabled={true}
          >
            Confirmar transferencia
          </button>
        )}

        {!formData.paymentMethod && (
          <button
            className="checkout-btn-disabled"
            disabled={true}
          >
            Seleccioná un método de pago
          </button>
        )}
      </div>
    </div>
  );
}
