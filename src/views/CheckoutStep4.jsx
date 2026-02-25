import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { crearPreferenciaMercadoPago, redirigirAMercadoPago } from "../services/mercadopagoService";
import { createGocuotasCheckout } from "../services/gocuotasService";
import { crearIntencionPagoModo } from "../services/modoService";
import { toast } from "react-hot-toast";
import ConfirmProofModal from "../components/ConfirmProofModal";
import qrCuentaDNI from "../assets/qrcuentaDNI.jpeg";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

// Solo guardar datos mínimos en localStorage (sin precios ni nombres)
const stripItemsForStorage = (items) =>
  items.map(({ productId, size, color, quantity }) => ({
    productId, size, color, quantity: parseInt(quantity) || 1,
  }));

export default function Step4({ formData, items, totalPrice, shippingPrice = 0, back, clearCheckout, updateField }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProofStep, setShowProofStep] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Costo de envío (pickup = gratis)
  const envio = formData.shippingMethod === "pickup" ? 0 : shippingPrice;
  const totalConEnvio = totalPrice + envio;

  // Calcular descuento por transferencia (solo sobre productos, no envío)
  const discount = (formData.paymentMethod === "transfer" ? totalPrice * 0.1 : 0);
  const finalPrice = totalConEnvio - discount;

  // ⭐ Pagar con Modo (producción - SDK modal)
  const handlePagarModo = async () => {
    if (!formData.email) {
      toast.error("Email requerido");
      return;
    }

    setLoadingPayment(true);

    try {
      const itemsValidos = items.map((item) => ({
        productId: item.productId,
        title: item.name || "Producto",
        description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        price: item.price,
        discount: item.discount || 0,
        picture_url: item.image || "",
        size: item.size,
        color: item.color
      }));

      const response = await crearIntencionPagoModo({
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
        shippingCost: envio,
        metadata: {
          orderType: "checkout",
          shippingMethod: formData.shippingMethod,
        },
      });

      const pi = response?.paymentIntent;
      if (!pi?.qr || !pi?.id) {
        toast.error("Error al crear la intención de pago con Modo");
        setLoadingPayment(false);
        return;
      }

      // Guardar datos de orden pendiente antes de abrir el modal
      localStorage.setItem("pendingOrder", JSON.stringify({
        userId: user?.id || null,
        formData,
        items: stripItemsForStorage(items),
        createdAt: new Date().toISOString(),
      }));

      // Abrir modal SDK de Modo
      if (typeof window.ModoSDK !== "undefined" && window.ModoSDK.modoInitPayment) {
        window.ModoSDK.modoInitPayment({
          qrString: pi.qr,
          checkoutId: pi.id,
          deeplink: pi.deeplink,
          callbackURL: `${window.location.origin}/checkout/success`,
          onSuccess: async () => {
            try {
              const pendingOrderStr = localStorage.getItem("pendingOrder");
              if (pendingOrderStr) {
                const pendingOrderData = JSON.parse(pendingOrderStr);
                const confirmRes = await fetch(apiPath("/modo/confirm-payment"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    checkoutId: pi.id,
                    pendingOrderData,
                  }),
                });
                const confirmData = await confirmRes.json();
                if (confirmData.success && confirmData.order?.code) {
                  localStorage.setItem("lastOrderCode", confirmData.order.code);
                }
              }
              clearCart();
              localStorage.removeItem("checkoutStep");
              localStorage.removeItem("checkoutFormData");
              localStorage.removeItem("pendingOrder");
              navigate("/checkout/success");
            } catch (err) {
              console.error("Error confirmando pago Modo:", err);
              toast.error("El pago fue exitoso pero hubo un error creando la orden. Contactanos.");
            }
          },
          onFailure: () => {
            toast.error("El pago fue rechazado");
            setLoadingPayment(false);
          },
          onCancel: () => {
            setLoadingPayment(false);
          },
          onClose: () => {
            setLoadingPayment(false);
          },
        });
      } else {
        // Fallback: si el SDK no cargó, mostrar error
        console.error("ModoSDK no disponible");
        toast.error("Error cargando Modo. Intentá de nuevo.");
        setLoadingPayment(false);
      }
    } catch (error) {
      console.error("Error en Modo:", error);
      toast.error("Error al procesar el pago");
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
        productId: item.productId,
        title: item.name || "Producto",
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        price: item.price,
        discount: item.discount || 0,
        picture_url: item.image || "",
        description: `Talle: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`,
        size: item.size,
        color: item.color,
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
          userId: user?.id || null,
          formData,
          items: stripItemsForStorage(items),
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
        productId: item.productId,
        title: item.name || "Producto",
        description: item.description || "",
        picture_url: item.image || "",
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price) || 0,
        price: item.price,
        discount: item.discount || 0,
        currency_id: "ARS",
        size: item.size,
        color: item.color,
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
          userId: user?.id || null,
          formData,
          items: stripItemsForStorage(items),
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
      // Guardar orden (solo datos mínimos, sin precios)
      localStorage.setItem("pendingOrder", JSON.stringify({
        userId: user?.id || null,
        formData,
        items: stripItemsForStorage(items),
        paymentProof: proofBase64,
        paymentProofName: proofFile?.name || null,
        createdAt: new Date().toISOString(),
      }));

      toast.success("Procesando tu orden...");

      // Crear orden en el backend con datos de transferencia
      const response = await fetch(apiPath("/orders/create-transfer"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || null,
          formData,
          items: stripItemsForStorage(items),
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

  // ⭐ Comprimir imagen si es muy grande (para evitar errores con base64 pesado)
  const comprimirImagen = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // si falla, devolver original
      };
      img.src = url;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB
        toast.error("El archivo no puede exceder 15MB");
        return;
      }
      // Comprimir imágenes > 2MB para que no falle el envío
      if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
        const comprimido = await comprimirImagen(file);
        setProofFile(comprimido);
      } else {
        setProofFile(file);
      }
    }
  };

  const shippingLabel =
    formData.shippingMethod === "pickup"
      ? "Retiro en Pick Up Point"
      : formData.shippingMethod === "correo-branch"
        ? "Envío a sucursal (Correo Argentino)"
        : "Envío a domicilio (Correo Argentino)";

  const paymentLabel =
    formData.paymentMethod === "transfer"
      ? "Transferencia bancaria (10% OFF)"
      : formData.paymentMethod === "cuentadni"
        ? "Cuenta DNI"
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

        {(formData.shippingMethod === "correo-home" || formData.shippingMethod === "home") && (
          <>
            <p><strong>Dirección:</strong> {formData.address}</p>
            <p><strong>Código postal:</strong> {formData.postalCode}</p>
            <p><strong>Provincia:</strong> {formData.province}</p>
          </>
        )}

        {formData.shippingMethod === "correo-branch" && (
          <>
            <p><strong>Código postal:</strong> {formData.postalCode}</p>
            <p><strong>Provincia:</strong> {formData.province}</p>
            <p><strong>Localidad:</strong> {formData.localidad}</p>
            {formData.selectedAgency && (
              <p><strong>Sucursal:</strong> {formData.selectedAgency.name} — {formData.selectedAgency.address}, {formData.selectedAgency.locality}</p>
            )}
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
          <p style={{ fontSize: "0.95rem", color: "#555" }}>
            Subtotal productos: ${totalPrice.toLocaleString("es-AR")}
          </p>

          {envio > 0 && (
            <p style={{ fontSize: "0.95rem", color: "#555", marginTop: "4px" }}>
              Envío ({formData.shippingMethod === "correo-branch" ? "Sucursal" : "Domicilio"}): ${envio.toLocaleString("es-AR")}
            </p>
          )}

          {formData.shippingMethod === "pickup" && (
            <p style={{ fontSize: "0.95rem", color: "#2e7d32", marginTop: "4px" }}>
              Envío: Gratis (Retiro)
            </p>
          )}

          {discount > 0 && (
            <p style={{ color: "#d94f7a", fontWeight: 600, marginTop: "8px" }}>
              -10% descuento transferencia: -${discount.toLocaleString("es-AR")}
            </p>
          )}

          <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "#d94f7a", marginTop: "10px" }}>
            Total a pagar: ${finalPrice.toLocaleString("es-AR")}
          </p>
        </div>
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

        {formData.paymentMethod === "transfer" && !showProofStep && (
          <button
            className="checkout-btn-transfer"
            onClick={() => setShowProofStep(true)}
            disabled={loadingPayment}
            style={{
              padding: "12px 24px",
              background: !loadingPayment ? "#d94f7a" : "#e0e0e0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: !loadingPayment ? "pointer" : "not-allowed",
              opacity: 1,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loadingPayment) {
                e.target.style.background = "#c93b63";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#d94f7a";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Confirmar compra
          </button>
        )}

        {formData.paymentMethod === "cuentadni" && !showProofStep && (
          <button
            className="checkout-btn-cuentadni"
            onClick={() => setShowProofStep(true)}
            disabled={loadingPayment}
            style={{
              padding: "12px 24px",
              background: !loadingPayment ? "#d94f7a" : "#e0e0e0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: !loadingPayment ? "pointer" : "not-allowed",
              opacity: 1,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loadingPayment) {
                e.target.style.background = "#c93b63";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#d94f7a";
              e.target.style.transform = "translateY(0)";
            }}
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

      {/* ⭐ SECCIÓN DE COMPROBANTE (aparece después de confirmar) */}
      {showProofStep && (formData.paymentMethod === "transfer" || formData.paymentMethod === "cuentadni") && (
        <div className="review-box" style={{ marginTop: "20px", borderTop: "2px solid #d94f7a" }}>
          <h3 style={{ color: "#d94f7a" }}>
            {formData.paymentMethod === "transfer" ? "Comprobante de transferencia" : "Comprobante de Cuenta DNI"}
          </h3>

          {formData.paymentMethod === "transfer" && (
            <div style={{ background: "#fff7fb", borderRadius: "10px", padding: "16px", marginBottom: "16px", lineHeight: "1.8" }}>
              <p style={{ fontSize: "0.92rem", color: "#555", margin: "0 0 8px 0", fontWeight: 600 }}>
                Datos para la transferencia:
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 2px 0" }}>
                <strong>Banco:</strong> Banco Santander
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 2px 0" }}>
                <strong>Cuenta:</strong> CAJA DE AHORRO EN PESOS 000-642556/6
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 2px 0" }}>
                <strong>CBU:</strong> 0720000788000064255668
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 2px 0" }}>
                <strong>Alias:</strong> GRANO.PLAYA.PRISMA
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 2px 0" }}>
                <strong>Titular:</strong> CASTELLS ZWEIFEL NICOLE CAROLINA
              </p>
              <p style={{ fontSize: "0.88rem", color: "#666", margin: "0 0 10px 0" }}>
                <strong>CUIT:</strong> 27391049802
              </p>
              <p style={{ fontSize: "0.92rem", color: "#666", margin: 0 }}>
                <strong>Total a transferir:</strong>{" "}
                <span style={{ color: "#d94f7a", fontWeight: 700, fontSize: "1.05rem" }}>${finalPrice.toLocaleString("es-AR")}</span>
              </p>
            </div>
          )}

          {formData.paymentMethod === "cuentadni" && (
            <div style={{ background: "#e8f5f0", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ fontSize: "0.95rem", color: "#333", marginBottom: "12px", fontWeight: 600, textAlign: "center" }}>
                Escaneá el código QR para realizar el pago
              </p>
              <div style={{ textAlign: "center" }}>
                <img
                  src={qrCuentaDNI}
                  alt="QR Cuenta DNI"
                  onClick={() => setShowQRModal(true)}
                  style={{
                    maxWidth: "250px",
                    height: "auto",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                />
              </div>

              <div style={{ marginTop: "16px", padding: "14px", background: "#f0faf5", borderRadius: "8px", border: "1px solid #c8e6d8", lineHeight: "1.8" }}>
                <p style={{ fontSize: "0.88rem", color: "#555", margin: "0 0 2px 0" }}>
                  <strong>Titular:</strong> Nicole Carolina Castells Zweifel
                </p>
                <p style={{ fontSize: "0.88rem", color: "#555", margin: "0 0 2px 0" }}>
                  <strong>Nro. de cuenta:</strong> 5004 552835-6
                </p>
                <p style={{ fontSize: "0.88rem", color: "#555", margin: "0 0 2px 0" }}>
                  <strong>Tipo de cuenta:</strong> Caja de ahorros en pesos
                </p>
                <p style={{ fontSize: "0.88rem", color: "#555", margin: "0 0 2px 0" }}>
                  <strong>CBU:</strong> 0140061803500455283560
                </p>
                <p style={{ fontSize: "0.88rem", color: "#555", margin: 0 }}>
                  <strong>Alias:</strong> HELLOCOMFY.DNI
                </p>
              </div>

              <p style={{ fontSize: "0.92rem", color: "#666", margin: "12px 0 0 0", textAlign: "center" }}>
                <strong>Total a pagar:</strong>{" "}
                <span style={{ color: "#00a86b", fontWeight: 700, fontSize: "1.05rem" }}>${finalPrice.toLocaleString("es-AR")}</span>
              </p>
              <p style={{ fontSize: "0.82rem", color: "#888", margin: "8px 0 0 0", fontStyle: "italic", textAlign: "center" }}>
                ℹ️ Las promociones de Cuenta DNI son propias de su plataforma. Los reintegros se realizan de forma automática.
              </p>
            </div>
          )}

          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "12px" }}>
            Podés adjuntar tu comprobante ahora o enviarlo después por WhatsApp
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

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <button
              onClick={handleTransfer}
              disabled={loadingPayment}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: loadingPayment ? "#e0e0e0" : "#d94f7a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loadingPayment ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                minWidth: "180px",
              }}
            >
              {loadingPayment ? "Procesando..." : proofFile ? "Enviar pedido con comprobante" : "Enviar pedido sin comprobante"}
            </button>
            {!loadingPayment && (
              <button
                onClick={() => setShowProofStep(false)}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Volver
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal para ampliar QR Cuenta DNI */}
      {showQRModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            cursor: "pointer",
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={qrCuentaDNI}
              alt="QR Cuenta DNI Ampliado"
              style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px" }}
            />
            <p style={{ margin: "14px 0 0 0", fontSize: "1rem", color: "#333", textAlign: "center" }}>
              También podés abonar con nuestro Alias: <strong style={{ color: "#00a86b" }}>HELLOCOMFY.DNI</strong>
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              style={{
                position: "absolute",
                top: "10px", right: "10px",
                background: "#d94f7a",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px", height: "40px",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal para confirmar compra sin comprobante */}
      <ConfirmProofModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmNoProof}
        onCancel={handleCancelModal}
        paymentMethod={formData.paymentMethod}
      />
    </div>
  );
}
