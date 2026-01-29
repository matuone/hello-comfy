import mongoose from "mongoose";
import Customer from "./models/Customer.js";

const MONGO_URI = "mongodb://localhost:27017/hellocomfy";

async function removeTelefono() {
  await mongoose.connect(MONGO_URI);
  const antes = await Customer.countDocuments({ telefono: { $exists: true } });
  console.log("Customers con 'telefono' antes:", antes);
  const res = await Customer.updateMany({}, { $unset: { telefono: "" } });
  console.log("Resultado updateMany:", res);
  const despues = await Customer.countDocuments({ telefono: { $exists: true } });
  console.log("Customers con 'telefono' después:", despues);
  await mongoose.disconnect();
}

removeTelefono();
