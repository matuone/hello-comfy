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

    // 24 horas para admin (largo para permitir trabajo continuo)
    const token = jwt.sign(
      { id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      email: admin.email,
      isAdmin: true
    });

  } catch (err) {
    console.error("Error en login admin");
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Verificar si el token del admin es válido
export async function verifyAdminToken(req, res) {
  try {
    // El middleware verifyAdmin ya validó el token, si llegamos aquí es válido
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(401).json({ error: "Admin no encontrado" });
    }
    return res.json({
      valid: true,
      email: admin.email,
      id: admin._id
    });
  } catch (err) {
    console.error("Error al verificar token admin");
    return res.status(401).json({ error: "Token inválido" });
  }
}

