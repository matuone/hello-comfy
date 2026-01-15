import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { crearPreferenciaMercadoPago, redirigirAMercadoPago } from "../services/mercadopagoService";
import { createGocuotasCheckout } from "../services/gocuotasService";
import { crearIntencionPagoModo } from "../services/modoService";
import { toast } from "react-hot-toast";
import ConfirmProofModal from "../components/ConfirmProofModal";

export default function Step4({ formData, items, totalPrice, back, clearCheckout, updateField }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calcular descuento por transferencia
  const discount = formData.paymentMethod === "transfer" ? totalPrice * 0.1 : 0;
  const finalPrice = totalPrice - discount;

  // ⭐ Pagar con Modo
  const handlePagarModo = async () => {
    if (!formData.email) {
      toast.error("Email requerido");
      return;
    }

    setLoadingPayment(true);

    try {
      const itemsValidos = items.map((item) => ({
        title: item.name || "Producto",
        description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        picture_url: item.image || "",
        productId: item.id,
        size: item.size,
        color: item.color
      }));

      const paymentIntent = await crearIntencionPagoModo({
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
        },
        shippingCost: 0,
        metadata: {
          orderType: "checkout",
          shippingMethod: formData.shippingMethod,
        },
      });

      if (paymentIntent?.paymentIntent?.checkout_url) {
        localStorage.setItem("pendingOrder", JSON.stringify({
          formData,
          items,
          totalPrice,
          createdAt: new Date().toISOString(),
        }));
        window.location.href = paymentIntent.paymentIntent.checkout_url;
      } else {
        toast.error("Error al crear la intención de pago con Modo");
      }
    } catch (error) {
      console.error("Error en Modo:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoadingPayment(false);
    }
  };

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

  // ⭐ Crear orden en el backend
  const crearOrden = async (proofBase64) => {
    try {
      // Guardar orden con o sin comprobante
      localStorage.setItem("pendingOrder", JSON.stringify({
        formData,
        items,
        totalPrice: finalPrice,
        paymentProof: proofBase64,
        paymentProofName: proofFile?.name || null,
        createdAt: new Date().toISOString(),
      }));

      toast.success("Procesando tu orden...");

      // Crear orden en el backend con datos de transferencia
      const response = await fetch("http://localhost:5000/api/orders/create-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          items,
          totalPrice: finalPrice,
          paymentProof: proofBase64,
          paymentProofName: proofFile?.name || null,
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        localStorage.setItem("lastOrderCode", orderData.order.code);
        clearCart();
        localStorage.removeItem("checkoutStep");
        localStorage.removeItem("checkoutFormData");
        localStorage.removeItem("pendingOrder");

        // Redirigir a success
        setTimeout(() => {
          navigate("/checkout/success");
        }, 1000);
      } else {
        toast.error("Error al crear la orden");
        setLoadingPayment(false);
      }
    } catch (error) {
      console.error("Error creando orden:", error);
      toast.error("Error al procesar la transferencia");
      setLoadingPayment(false);
    }
  };

  // ⭐ Manejar transferencia bancaria
  const handleTransfer = () => {
    // Si no hay comprobante, mostrar modal
    if (!proofFile) {
      setShowConfirmModal(true);
      return;
    }

    setLoadingPayment(true);

    // Si hay archivo, convertirlo a base64 y crear orden
    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result;

      // Si tiene el prefijo de data URL, extraerlo (data:image/jpeg;base64,XXXX...)
      if (base64.includes(',')) {
        base64 = base64.split(',')[1];
      }

      // Proceder con la creación de orden
      crearOrden(base64);
    };
    reader.onerror = () => {
      console.error("Error leyendo archivo");
      toast.error("Error al procesar el archivo");
      setLoadingPayment(false);
    };
    reader.readAsDataURL(proofFile);
  };


  const handleConfirmNoProof = async () => {
    setShowConfirmModal(false);
    setLoadingPayment(true);

    try {
      // Crear orden sin comprobante
      await crearOrden(null);
    } catch (error) {
      console.error("Error al crear orden sin comprobante:", error);
      toast.error("Error al procesar la transferencia");
      setLoadingPayment(false);
    }
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("El archivo no puede exceder 5MB");
      return;
    }
    setProofFile(file);
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
      <div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          ${totalPrice.toLocaleString("es-AR")}
        </p>
        {discount > 0 && (
          <p style={{ color: "#d94f7a", fontWeight: 600, marginTop: "8px" }}>
            -10% descuento: -${discount.toLocaleString("es-AR")}
          </p>
        )}
        {discount > 0 && (
          <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "#d94f7a", marginTop: "8px" }}>
            Total a pagar: ${finalPrice.toLocaleString("es-AR")}
          </p>
        )}
      </div>
    </div>

    {/* ⭐ SECCIÓN DE TRANSFERENCIA */}
    {formData.paymentMethod === "transfer" && (
      <div className="review-box" style={{ marginTop: "20px", borderTop: "2px solid #d94f7a" }}>
        <h3 style={{ color: "#d94f7a" }}>Comprobante de transferencia</h3>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "12px" }}>
          Adjunta tu comprobante de transferencia para procesar tu pedido
        </p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{
            padding: "12px",
            border: "2px solid #d94f7a",
            borderRadius: "8px",
            width: "100%",
            background: "#fff7fb",
            color: "#666",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
        />
        {proofFile && (
          <p style={{ fontSize: "0.85rem", color: "#d94f7a", marginTop: "8px" }}>
            ✓ {proofFile.name}
          </p>
        )}
      </div>
    )}

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
          onClick={handleTransfer}
          disabled={loadingPayment}
          style={{
            padding: "12px 24px",
            background: !loadingPayment ? "#d94f7a" : "#e0e0e0",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: proofFile && !loadingPayment ? "pointer" : "not-allowed",
            opacity: 1,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (proofFile && !loadingPayment) {
              e.target.style.background = "#c93b63";
              e.target.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#d94f7a";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {loadingPayment ? "Procesando..." : "Confirmar transferencia"}
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

    {/* Modal para confirmar compra sin comprobante */}
    <ConfirmProofModal
      isOpen={showConfirmModal}
      onConfirm={handleConfirmNoProof}
      onCancel={handleCancelModal}
    />
  </div>
);
}
