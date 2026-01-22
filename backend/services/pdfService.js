import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function resolveLogoPath() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const candidates = [
      path.resolve(__dirname, '../assets/logofactura.png'),
      path.resolve(process.cwd(), 'backend', 'assets', 'logofactura.png'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
  } catch (_) {
    // ignore
  }
  return null;
}

function formatCurrency(n) {
  const num = Number(n || 0);
  return `$ ${num.toLocaleString('es-AR')}`;
}

export async function generarFacturaPDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      // Paleta Hello Comfy
      const brand = '#d94f7a'; // rosa marca
      const accent = '#ff9800'; // naranja
      const dark = '#333';
      const light = '#f9f9fb';

      // Header de marca
      doc.save();
      doc.rect(0, 0, doc.page.width, 70).fill(brand);

      const logoPath = resolveLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, 50, 12, { fit: [60, 60] });
        } catch (err) {
          console.warn('No se pudo cargar logo:', err.message);
          doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('Hello Comfy', 50, 25);
        }
      } else {
        doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('Hello Comfy', 50, 25);
      }

      doc.fillColor('white').font('Helvetica').fontSize(12).text('Comprobante Fiscal - Factura', 0, 30, { align: 'right' });
      doc.restore();

      // Caja de datos de factura
      const infoX = 50;
      const infoY = 100;
      const infoW = doc.page.width - 100;
      const infoH = 90;
      doc.save();
      doc.roundedRect(infoX, infoY, infoW, infoH, 10).fill(light);
      doc.roundedRect(infoX, infoY, infoW, infoH, 10).stroke(brand);
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(12).text(`Factura N°: ${order.facturaNumero || '-'}`, infoX + 12, infoY + 12);
      doc.font('Helvetica').text(`Fecha: ${order.facturaFecha || order.date || '-'}`, infoX + 12, infoY + 32);
      doc.text(`CAE: ${order.facturaCae || '-'}`, infoX + 12, infoY + 52);
      doc.text(`Vencimiento CAE: ${order.facturaVencimientoCAE || '-'}`, infoX + (infoW / 2), infoY + 52);
      doc.restore();

      // Datos del cliente
      const clienteY = infoY + infoH + 20;
      doc.font('Helvetica-Bold').fillColor(dark).fontSize(12).text('Cliente', infoX, clienteY);
      doc.moveTo(infoX, clienteY + 16).lineTo(infoX + 60, clienteY + 16).stroke(brand);
      doc.font('Helvetica').fillColor(dark).text(`${order.customer?.name || '-'}`, infoX, clienteY + 24);
      doc.text(`${order.customer?.email || '-'}`, infoX, clienteY + 40);

      // Tabla de items estilada
      const tableY = clienteY + 70;
      const colX = [infoX, infoX + 280, infoX + 360, infoX + 450];
      const colW = [280, 80, 90, 90];

      // Header de tabla
      doc.save();
      doc.rect(infoX, tableY, infoW, 28).fill(light);
      doc.rect(infoX, tableY, infoW, 28).stroke('#ddd');
      doc.fillColor(dark).font('Helvetica-Bold');
      doc.text('Producto', colX[0] + 8, tableY + 8, { width: colW[0] - 16 });
      doc.text('Cant.', colX[1] + 8, tableY + 8, { width: colW[1] - 16, align: 'right' });
      doc.text('Precio', colX[2] + 8, tableY + 8, { width: colW[2] - 16, align: 'right' });
      doc.text('Subtotal', colX[3] + 8, tableY + 8, { width: colW[3] - 16, align: 'right' });
      doc.restore();

      let rowY = tableY + 30;
      doc.font('Helvetica').fillColor(dark);
      (order.items || []).forEach((it) => {
        // fila background alterno
        doc.save();
        doc.rect(infoX, rowY - 2, infoW, 22).fillOpacity(0.04).fill(brand).fillOpacity(1).stroke('#eee');
        doc.restore();

        doc.text(it.name || '-', colX[0] + 8, rowY, { width: colW[0] - 16 });
        doc.text(String(it.quantity || 0), colX[1] + 8, rowY, { width: colW[1] - 16, align: 'right' });
        doc.text(formatCurrency(it.price), colX[2] + 8, rowY, { width: colW[2] - 16, align: 'right' });
        const subtotal = (it.quantity || 0) * (it.price || 0);
        doc.text(formatCurrency(subtotal), colX[3] + 8, rowY, { width: colW[3] - 16, align: 'right' });
        rowY += 24;
      });

      // Caja de totales
      const totalsY = rowY + 12;
      const totalsW = 220;
      const totalsX = infoX + infoW - totalsW;
      const totalsH = 120;
      doc.save();
      doc.roundedRect(totalsX, totalsY, totalsW, totalsH, 10).fill(light);
      doc.roundedRect(totalsX, totalsY, totalsW, totalsH, 10).stroke(accent);
      doc.font('Helvetica').fillColor(dark).fontSize(11);
      const t = order.totals || {};
      let lineY = totalsY + 12;
      doc.text(`Subtotal: ${formatCurrency(t.subtotal)}`, totalsX + 12, lineY, { align: 'left' });
      lineY += 20;
      doc.text(`Envío: ${formatCurrency(t.shipping)}`, totalsX + 12, lineY);
      lineY += 20;
      doc.text(`Descuento: ${formatCurrency(t.discount)}`, totalsX + 12, lineY);
      lineY += 20;
      doc.font('Helvetica-Bold').fillColor(dark).text(`Total: ${formatCurrency(t.total)}`, totalsX + 12, lineY);
      doc.restore();

      // Nota al pie
      doc.font('Helvetica').fillColor('#777').fontSize(10);
      doc.text('Gracias por su compra. Este comprobante fue emitido automáticamente por Hello Comfy.', 50, doc.page.height - 80, { width: doc.page.width - 100, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
