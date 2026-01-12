import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // ⭐ CAMBIO CLAVE: usar passwordHash
    const match = await bcrypt.compare(password, admin.passwordHash);


    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      email: admin.email,
      isAdmin: true
    });

  } catch (err) {
    console.error("Error en login admin:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
