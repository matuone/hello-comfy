import mongoose from "mongoose";
import SizeTable from "./models/SizeTable.js";
import dotenv from "dotenv";

dotenv.config();

const sizeTables = [
  {
    name: "baby-tees",
    displayName: "Baby Tees",
    sizes: ["S", "M", "L", "XL"],
    measurements: [
      {
        name: "HOMBROS",
        values: { S: "36cm", M: "39cm", L: "40cm", XL: "43cm" },
      },
      {
        name: "PECHO",
        values: { S: "42cm", M: "43cm", L: "45cm", XL: "48cm" },
      },
      {
        name: "LARGO",
        values: { S: "49cm", M: "50cm", L: "51cm", XL: "53cm" },
      },
      {
        name: "MANGAS",
        values: { S: "12cm", M: "13cm", L: "14cm", XL: "15cm" },
      },
    ],
    note: "* Las medidas pueden variar +/- 1 a 2cm",
    active: true,
    order: 1,
  },
  {
    name: "crop-tops",
    displayName: "Crop Tops",
    sizes: ["S", "M", "L", "XL"],
    measurements: [
      {
        name: "HOMBROS",
        values: { S: "37cm", M: "39cm", L: "40cm", XL: "42cm" },
      },
      {
        name: "PECHO",
        values: { S: "40cm", M: "42cm", L: "44cm", XL: "46cm" },
      },
      {
        name: "LARGO",
        values: { S: "46cm", M: "50cm", L: "52cm", XL: "54cm" },
      },
    ],
    note: "* Las medidas pueden variar +/- 1 a 2cm",
    active: true,
    order: 2,
  },
  {
    name: "remeras",
    displayName: "Remeras",
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    measurements: [
      {
        name: "HOMBROS",
        values: {
          S: "43cm",
          M: "46cm",
          L: "47cm",
          XL: "49cm",
          XXL: "52cm",
          "3XL": "54cm",
        },
      },
      {
        name: "PECHO",
        values: {
          S: "50cm",
          M: "54cm",
          L: "56cm",
          XL: "58cm",
          XXL: "60cm",
          "3XL": "64cm",
        },
      },
      {
        name: "LARGO",
        values: {
          S: "65cm",
          M: "67cm",
          L: "68cm",
          XL: "70cm",
          XXL: "73cm",
          "3XL": "76cm",
        },
      },
    ],
    note: "* Las medidas pueden variar +/- 1 a 2cm",
    active: true,
    order: 3,
  },
];

async function seedSizeTables() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar tablas existentes
    await SizeTable.deleteMany({});
    console.log("🗑️  Tablas anteriores eliminadas");

    // Insertar nuevas tablas
    const result = await SizeTable.insertMany(sizeTables);
    console.log(`✅ ${result.length} tablas de talles creadas correctamente`);

    mongoose.connection.close();
    console.log("🔒 Conexión cerrada");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedSizeTables();
