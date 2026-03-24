export function assertValidCheckoutShipping({ shippingMethod, pickPoint, selectedAgency } = {}) {
  const normalizedMethod = typeof shippingMethod === "string" ? shippingMethod.trim() : "";
  const normalizedPickPoint = typeof pickPoint === "string" ? pickPoint.trim() : "";

  if (normalizedMethod === "pickup" && !normalizedPickPoint) {
    const error = new Error("El punto de retiro es obligatorio para pedidos con Pick Up Point");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedMethod === "correo-branch" && !selectedAgency?.code) {
    const error = new Error("Debés seleccionar una sucursal para envíos a sucursal");
    error.statusCode = 400;
    throw error;
  }
}
