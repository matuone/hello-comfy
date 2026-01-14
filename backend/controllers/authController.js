// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// ===============================
// REGISTRO DE USUARIO
// ===============================
export async function registerUser(req, res) {
  try {
    const {
      name,
      email,
      password,
      dni,
      whatsapp,
      address,
    } = req.body;

    // Validaciones básicas
    if (!name || !email || !password || !dni || !whatsapp || !address) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar dirección
    const requiredAddressFields = ["street", "number", "city", "province", "postalCode"];
    for (const field of requiredAddressFields) {
      if (!address[field]) {
        return res.status(400).json({ error: `Falta el campo de dirección: ${field}` });
      }
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      dni: validator.escape(dni),
      whatsapp: validator.escape(whatsapp),
      address: {
        street: validator.escape(address.street),
        number: validator.escape(address.number),
        floor: address.floor ? validator.escape(address.floor) : "",
        city: validator.escape(address.city),
        province: validator.escape(address.province),
        postalCode: validator.escape(address.postalCode),
      },
      method: "email",
    });

    // Generar token
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        isAdmin: newUser.isAdmin,
      },
    });

  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// LOGIN DE USUARIO
// ===============================
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Respuesta
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// ACTUALIZAR PERFIL DE USUARIO
// ===============================
export async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const { name, dni, whatsapp, address } = req.body;

    // Validar que el usuario que hace la solicitud es el mismo
    if (req.user.id !== id) {
      return res.status(403).json({ error: "No tienes permiso para actualizar este perfil" });
    }

    // Buscar el usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar campos
    if (name) user.name = name.trim();
    if (dni) user.dni = dni.trim();
    if (whatsapp) user.whatsapp = whatsapp.trim();
    if (address) {
      user.address = {
        street: address.street?.trim() || user.address?.street || "",
        number: address.number?.trim() || user.address?.number || "",
        floor: address.floor?.trim() || user.address?.floor || "",
        city: address.city?.trim() || user.address?.city || "",
        province: address.province?.trim() || user.address?.province || "",
        postalCode: address.postalCode?.trim() || user.address?.postalCode || "",
      };
    }

    // Guardar
    await user.save();

    // Respuesta
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        whatsapp: user.whatsapp,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
}

// ===============================
// ACTUALIZAR AVATAR DEL USUARIO
// ===============================
export async function updateUserAvatar(req, res) {
  try {
    const { id } = req.params;

    // Validar que el usuario que hace la solicitud es el mismo
    if (req.user.id !== id) {
      return res.status(403).json({ error: "No tienes permiso para actualizar este avatar" });
    }

    // Validar que hay archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    // Buscar el usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Convertir buffer a base64 y subir a Cloudinary
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "hello-comfy/avatars",
      resource_type: "auto",
    });

    // Actualizar avatar del usuario
    user.avatar = result.secure_url;
    await user.save();

    // Respuesta
    res.json({
      success: true,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("Error al actualizar avatar:", err);
    res.status(500).json({ error: "Error al actualizar el avatar" });
  }
}
