// checkStock.js
import mongoose from 'mongoose';
import StockColor from './backend/models/StockColor.js';
import Product from './backend/models/Product.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend', '.env') });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo");

    const stockId = new mongoose.Types.ObjectId("6990990d927e96ed13902a83"); // Natural color ID

    // Bypass Mongoose and query raw collection
    const rawStock = await mongoose.connection.db.collection('stockcolors').findOne({ _id: stockId });

    console.log("RAW Stock Color Document (MongoDB Driver):");
    console.log(JSON.stringify(rawStock, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
