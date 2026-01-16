import PDFDocument from 'pdfkit';

export async function generarFacturaPDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Encabezado
      doc
        .fontSize(18)
        .fillColor('#333')
        .text('Hello Comfy', { align: 'left' })
        .moveDown(0.3);
      doc
        .fontSize(12)
        .fillColor('#666')
        .text('Comprobante Fiscal - Factura', { align: 'left' })
        .moveDown(1);

      // Datos de factura
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(`Número de factura: ${order.facturaNumero}`)
        .text(`Fecha: ${order.facturaFecha || order.date}`)
        .text(`CAE: ${order.facturaCae || '-'}`)
        .text(`Vencimiento CAE: ${order.facturaVencimientoCAE || '-'}`)
        .moveDown(1);

      // Datos del cliente
      doc
        .fontSize(12)
        .fillColor('#000')
        .text('Cliente:', { underline: true })
        .moveDown(0.2)
        .text(`${order.customer?.name || '-'}`)
        .text(`${order.customer?.email || '-'}`)
        .moveDown(1);

      // Items
      doc
        .fontSize(12)
        .fillColor('#000')
        .text('Detalle de productos', { underline: true })
        .moveDown(0.5);

      const tableTop = doc.y;
      const itemX = 50;
      const qtyX = 330;
      const priceX = 400;
      const totalX = 480;

      doc.font('Helvetica-Bold').text('Producto', itemX, tableTop);
      doc.text('Cant.', qtyX, tableTop);
      doc.text('Precio', priceX, tableTop);
      doc.text('Subtotal', totalX, tableTop);
      doc.moveDown(0.8);
      doc.font('Helvetica');

      (order.items || []).forEach((it) => {
        const y = doc.y;
        doc.text(it.name || '-', itemX, y, { width: qtyX - itemX - 10 });
        doc.text(String(it.quantity || 0), qtyX, y);
        doc.text(`$ ${Number(it.price || 0).toLocaleString('es-AR')}`, priceX, y);
        const subtotal = (it.quantity || 0) * (it.price || 0);
        doc.text(`$ ${subtotal.toLocaleString('es-AR')}`, totalX, y);
        doc.moveDown(0.5);
      });

      doc.moveDown(1);
      doc.font('Helvetica-Bold').text(`Total: $ ${Number(order.totals?.total || 0).toLocaleString('es-AR')}`, { align: 'right' });
      doc.font('Helvetica').moveDown(2);

      doc.text('Gracias por su compra.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
