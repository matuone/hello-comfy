// Servicio de alerta de bajo stock para HelloComfy
import cron from "node-cron";
import Product from "../models/Product.js";
import StockColor from "../models/StockColor.js";
import SiteConfig from "../models/SiteConfig.js";
import sendEmail from "./emailService.js";

const ALERT_EMAIL = "hellocomfyind@gmail.com";
const ALERT_CRON = "0 * * * *"; // Cada 1 hora

// Busca o crea el registro de última alerta
async function getLastAlertDate() {
  let config = await SiteConfig.findOne({ key: "lastStockAlert" });
  if (!config) {
    config = new SiteConfig({ key: "lastStockAlert", value: "1970-01-01" });
    await config.save();
  }
  return config;
}

// Devuelve true si la alerta ya fue enviada hoy
function isToday(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr.slice(0, 10) === today;
}

// Arma la lista de talles/colores con bajo stock
async function getLowStockList() {
  const productos = await Product.find({}).populate('stockColorId');
  const lowStock = [];
  for (const prod of productos) {
    const stockColor = prod.stockColorId;
    if (stockColor && stockColor.talles) {
      const colorNombre = stockColor.color;
      for (const [talle, stock] of Object.entries(stockColor.talles)) {
        if (typeof stock === "number" && stock <= 4) {
          lowStock.push({
            producto: prod.name,
            color: colorNombre,
            talle,
            stock,
          });
        }
      }
    }
  }
  // Ordenar de menor a mayor stock
  lowStock.sort((a, b) => a.stock - b.stock);
  return lowStock;
}


// Envía el email de alerta con formato comfy y agrupado
async function sendStockAlertEmail(lista) {
  let html = `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #faf7ff; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #a259e6; text-align: center; margin-bottom: 8px;">🚨 Alerta de bajo stock</h2>
    <p style="text-align: center; color: #333; margin-bottom: 24px;">Estos son los productos, colores y talles con stock crítico (4 o menos unidades).<br>Por favor, revisá y reponé lo antes posible.</p>`;

  // Agrupar por producto y color
  const agrupado = {};
  for (const item of lista) {
    if (!agrupado[item.producto]) agrupado[item.producto] = {};
    if (!agrupado[item.producto][item.color]) agrupado[item.producto][item.color] = [];
    agrupado[item.producto][item.color].push(item);
  }

  for (const producto in agrupado) {
    html += `<div style="margin-bottom: 18px; padding: 16px; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px #eee;">
      <h3 style="color: #764ba2; margin: 0 0 8px 0;">${producto}</h3>`;
    for (const color in agrupado[producto]) {
      html += `<div style="margin-bottom: 8px;"><b style="color:#a259e6">Color:</b> ${color}<ul style="margin: 4px 0 0 16px; padding: 0;">`;
      for (const item of agrupado[producto][color]) {
        html += `<li style="margin-bottom: 2px; color: #333;">
          <span style="display:inline-block; min-width:60px;"><b>Talle:</b> ${item.talle}</span>
          <span style="display:inline-block; min-width:60px; color:${item.stock <= 2 ? '#e74c3c' : '#f39c12'}"><b>Stock:</b> ${item.stock}</span>
        </li>`;
      }
      html += `</ul></div>`;
    }
    html += `</div>`;
  }

  html += `<p style="text-align:center; color:#888; font-size:13px; margin-top:32px;">Este aviso se envía automáticamente una vez al día.<br>Equipo HelloComfy</p></div>`;

  await sendEmail({
    to: ALERT_EMAIL,
    subject: "🚨 Bajo stock en color y talle - HelloComfy",
    html,
  });
}

// Tarea programada
cron.schedule(ALERT_CRON, async () => {
  try {
    const config = await getLastAlertDate();
    if (isToday(config.value)) return; // Ya se envió hoy
    const lista = await getLowStockList();
    if (lista.length === 0) return;
    await sendStockAlertEmail(lista);
    config.value = new Date().toISOString();
    await config.save();
    console.log("[StockAlert] Email enviado");
  } catch (err) {
    console.error("[StockAlert] Error:", err);
  }
});

export { getLowStockList, sendStockAlertEmail };
