import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import Feed from "../models/Feed.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
const UPLOADS_BASE = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../../uploads");
const PUBLIC_BASE = (process.env.FRONTEND_URL || "http://localhost:5000").replace(/\/$/, "");

const APPLY = process.argv.includes("--apply");

if (!MONGO_URI) {
  console.error("Falta MONGO_URI en backend/.env");
  process.exit(1);
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && /cloudinary\.com/i.test(url);
}

function extFromContentType(contentType) {
  if (!contentType) return "";
  const clean = contentType.split(";")[0].trim().toLowerCase();
  if (clean === "image/jpeg") return ".jpg";
  if (clean === "image/png") return ".png";
  if (clean === "image/webp") return ".webp";
  if (clean === "image/gif") return ".gif";
  if (clean === "image/svg+xml") return ".svg";
  return "";
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch (_) {
    // Ignorar parsing inválido
  }
  return ".jpg";
}

function buildFilename(sourceUrl, ext) {
  const hash = crypto.createHash("sha1").update(sourceUrl).digest("hex").slice(0, 12);
  return `${Date.now()}-${hash}${ext}`;
}

async function ensureDir(subfolder) {
  await fs.mkdir(path.join(UPLOADS_BASE, subfolder), { recursive: true });
}

const migratedCache = new Map();

async function migrateOneUrl(sourceUrl, subfolder) {
  if (migratedCache.has(sourceUrl)) {
    return migratedCache.get(sourceUrl);
  }

  if (!APPLY) {
    return sourceUrl;
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al descargar ${sourceUrl}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const ext = extFromContentType(contentType) || extFromUrl(sourceUrl);
  const filename = buildFilename(sourceUrl, ext);
  const destination = path.join(UPLOADS_BASE, subfolder, filename);

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destination, buffer);

  const newUrl = `${PUBLIC_BASE}/uploads/${subfolder}/${filename}`;
  migratedCache.set(sourceUrl, newUrl);
  return newUrl;
}

async function migrateProducts(stats) {
  const products = await Product.find({
    images: { $elemMatch: { $regex: "cloudinary\\.com", $options: "i" } },
  });

  stats.products.totalCandidates = products.length;

  for (const product of products) {
    let changed = false;
    const nextImages = [];

    for (const url of product.images || []) {
      if (isCloudinaryUrl(url)) {
        try {
          const newUrl = await migrateOneUrl(url, "products");
          nextImages.push(newUrl);
          changed = changed || newUrl !== url;
          stats.products.urlsMigrated += 1;
        } catch (err) {
          stats.products.errors += 1;
          nextImages.push(url);
          console.error(`[PRODUCT] Error en ${product._id}: ${err.message}`);
        }
      } else {
        nextImages.push(url);
      }
    }

    if (changed && APPLY) {
      product.images = nextImages;
      await product.save();
      stats.products.documentsUpdated += 1;
    }
  }
}

async function migrateFeed(stats) {
  const posts = await Feed.find({ imageUrl: { $regex: "cloudinary\\.com", $options: "i" } });

  stats.feed.totalCandidates = posts.length;

  for (const post of posts) {
    if (!isCloudinaryUrl(post.imageUrl)) continue;

    try {
      const newUrl = await migrateOneUrl(post.imageUrl, "products");
      stats.feed.urlsMigrated += 1;

      if (APPLY && newUrl !== post.imageUrl) {
        post.imageUrl = newUrl;
        await post.save();
        stats.feed.documentsUpdated += 1;
      }
    } catch (err) {
      stats.feed.errors += 1;
      console.error(`[FEED] Error en ${post._id}: ${err.message}`);
    }
  }
}

async function migrateUsers(stats) {
  const users = await User.find({ avatar: { $regex: "cloudinary\\.com", $options: "i" } });

  stats.users.totalCandidates = users.length;

  for (const user of users) {
    if (!isCloudinaryUrl(user.avatar)) continue;

    // Algunos usuarios pueden tener un avatar default viejo de Cloudinary que ya no existe.
    // En ese caso dejamos avatar vacío para que el frontend use su imagen fallback local.
    if (/avatar-default\.png/i.test(user.avatar)) {
      if (APPLY) {
        user.avatar = "";
        await user.save();
        stats.users.documentsUpdated += 1;
      }
      stats.users.urlsMigrated += 1;
      continue;
    }

    try {
      const newUrl = await migrateOneUrl(user.avatar, "avatars");
      stats.users.urlsMigrated += 1;

      if (APPLY && newUrl !== user.avatar) {
        user.avatar = newUrl;
        await user.save();
        stats.users.documentsUpdated += 1;
      }
    } catch (err) {
      stats.users.errors += 1;
      console.error(`[USER] Error en ${user._id}: ${err.message}`);
    }
  }
}

async function main() {
  const stats = {
    products: { totalCandidates: 0, urlsMigrated: 0, documentsUpdated: 0, errors: 0 },
    feed: { totalCandidates: 0, urlsMigrated: 0, documentsUpdated: 0, errors: 0 },
    users: { totalCandidates: 0, urlsMigrated: 0, documentsUpdated: 0, errors: 0 },
  };

  try {
    await ensureDir("products");
    await ensureDir("avatars");

    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");
    console.log(APPLY ? "Modo APPLY: se guardan cambios" : "Modo DRY-RUN: no se guardan cambios");

    await migrateProducts(stats);
    await migrateFeed(stats);
    await migrateUsers(stats);

    console.log("\nResumen:");
    console.log("Productos:", stats.products);
    console.log("Feed:", stats.feed);
    console.log("Usuarios:", stats.users);

    if (!APPLY) {
      console.log("\nPara aplicar cambios reales, ejecutá el script con --apply");
    }
  } catch (err) {
    console.error("Error en migración:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
