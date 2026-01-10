import axios from "axios";

export async function generarFactura(order) {
  try {
    const payload = {
      // Datos del comercio
      token: process.env.FACTURANTE_API_KEY,
      cuit: process.env.FACTURANTE_CUIT,
      puntoVenta: process.env.FACTURANTE_PTO_VTA,

      // Tipo de comprobante (ej: 1 = Factura A, 6 = Factura B)
      tipoComprobante: process.env.FACTURANTE_TIPO_COMP,

      // Datos del cliente
      receptor: {
        email: order.customer.email,
        nombre: order.customer.name || "Consumidor Final",
        tipoDocumento: "DNI",
        numeroDocumento: "0",
      },

      // Items
      items: order.items.map((i) => ({
        descripcion: i.name,
        cantidad: i.quantity,
        precioUnitario: i.price,
        alicuotaIVA: 21,
      })),

      // Totales
      importeTotal: order.totals.total,
    };

    const response = await axios.post(
      "https://api.facturante.com/crear",
      payload
    );

    return response.data;
  } catch (err) {
    console.error("Error Facturante:", err.response?.data || err.message);
    throw new Error(err.response?.data?.mensaje || "Error al generar factura");
  }
}
