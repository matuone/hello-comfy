// Servicio de alerta de bajo stock para HelloComfy
import cron from "node-cron";
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
function isToday(value) {
  // value puede ser un string ISO, un Date object, o cualquier cosa
  let dateStr;
  if (value instanceof Date) {
    dateStr = value.toISOString();
  } else if (typeof value === "string") {
    dateStr = value;
  } else {
    // Valor inesperado, asumir que no se envió hoy
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return dateStr.slice(0, 10) === today;
}

// Arma la lista de talles/colores con bajo stock (directo desde StockColor)
async function getLowStockList() {
  const stockColors = await StockColor.find({});
  const lowStock = [];
  for (const sc of stockColors) {
    if (!sc.talles) continue;
    const tallesEntries = sc.talles instanceof Map
      ? [...sc.talles.entries()]
      : Object.entries(sc.talles || {});
    for (const [talle, stock] of tallesEntries) {
      if (typeof stock === "number" && stock <= 4) {
        lowStock.push({
          color: sc.color,
          talle,
          stock,
        });
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
    <p style="text-align: center; color: #333; margin-bottom: 24px;">Estos son los colores y talles con stock crítico (4 o menos unidades).<br>Por favor, revisá y reponé lo antes posible.</p>`;

  // Agrupar por color
  const agrupado = {};
  for (const item of lista) {
    if (!agrupado[item.color]) agrupado[item.color] = [];
    agrupado[item.color].push(item);
  }

  for (const color in agrupado) {
    html += `<div style="margin-bottom: 18px; padding: 16px; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px #eee;">
      <h3 style="color: #764ba2; margin: 0 0 8px 0;">${color}</h3>`;
    html += `<ul style="margin: 4px 0 0 16px; padding: 0;">`;
    for (const item of agrupado[color]) {
      html += `<li style="margin-bottom: 2px; color: #333;">
        <span style="display:inline-block; min-width:60px;"><b>Talle:</b> ${item.talle}</span>
        <span style="display:inline-block; min-width:60px; color:${item.stock <= 2 ? '#e74c3c' : '#f39c12'}"><b>Stock:</b> ${item.stock}</span>
      </li>`;
    }
    html += `</ul></div>`;
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
    if (isToday(config.value)) {
      return;
    }
    const lista = await getLowStockList();
    if (lista.length === 0) {
      console.log("[StockAlert] Sin productos con bajo stock, no se envía email");
      return;
    }
    console.log(`[StockAlert] Enviando email con ${lista.length} items de bajo stock...`);
    await sendStockAlertEmail(lista);
    config.value = new Date().toISOString();
    config.markModified("value"); // Forzar que Mongoose detecte el cambio en campo Mixed
    await config.save();
    console.log("[StockAlert] Email enviado correctamente");
  } catch (err) {
    console.error("[StockAlert] Error:", err);
  }
});

export { getLowStockList, sendStockAlertEmail };
