// ===============================
// CAMBIAR CONTRASEÑA DE USUARIO
// ===============================
export async function changeUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verificar que el usuario sea propietario del perfil
    if (req.user.id !== id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Buscar usuario
    const user = await User.findById(id).select("password");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    // Cambiar contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error cambiando contraseña", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
// controllers/authController.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";
import Order from "../models/Order.js";
import cloudinary from "../config/cloudinary.js";
import { enviarEmailVerificacion } from "../services/emailService.js";

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
      birthdate,
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

    // Crear usuario (sin verificar)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const newUser = await User.create({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      dni: validator.escape(dni),
      whatsapp: validator.escape(whatsapp),
      birthdate: birthdate ? new Date(birthdate) : undefined,
      address: {
        street: validator.escape(address.street),
        number: validator.escape(address.number),
        floor: address.floor ? validator.escape(address.floor) : "",
        city: validator.escape(address.city),
        province: validator.escape(address.province),
        postalCode: validator.escape(address.postalCode),
      },
      method: "email",
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Vincular órdenes previas del mismo email a esta cuenta
    try {
      await Order.updateMany(
        {
          "customer.email": newUser.email.toLowerCase(),
          userId: null
        },
        {
          $set: { userId: newUser._id }
        }
      );
    } catch (linkError) {
      // Error no crítico al vincular órdenes previas
    }

    // Enviar email de verificación
    await enviarEmailVerificacion(newUser.email, newUser.name, verificationToken);

    return res.status(201).json({
      message: "Cuenta creada. Revisá tu email para verificar tu cuenta.",
      needsVerification: true,
    });

  } catch (err) {
    console.error("Error en registro");
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

    // Bloquear login si el email no está verificado
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Tu email aún no fue verificado. Revisá tu bandeja de entrada.",
        needsVerification: true,
        email: user.email,
      });
    }

    // Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    // 30 minutos para usuarios normales, 2h para admin
    const expiresIn = user.isAdmin ? "2h" : "30m";
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn }
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
        dni: user.dni,
        whatsapp: user.whatsapp,
        birthdate: user.birthdate,
        address: user.address,
      },
    });

  } catch (err) {
    console.error("Error en login");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// ACTUALIZAR PERFIL DE USUARIO
// ===============================
export async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const { name, dni, whatsapp, address, birthdate } = req.body;

    // Verificar que el usuario sea propietario del perfil
    if (req.user.id !== id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Buscar usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar campos
    if (!name || !dni || !whatsapp) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Validar dirección si se proporciona
    if (address) {
      const requiredAddressFields = ["street", "number", "city", "province", "postalCode"];
      for (const field of requiredAddressFields) {
        if (!address[field]) {
          return res.status(400).json({ error: `Falta el campo de dirección: ${field}` });
        }
      }
    }

    // Actualizar datos
    user.name = validator.escape(name);
    user.dni = validator.escape(dni);
    user.whatsapp = validator.escape(whatsapp);
    if (birthdate) {
      user.birthdate = new Date(birthdate);
    }
    if (address) {
      user.address = {
        street: validator.escape(address.street),
        number: validator.escape(address.number),
        floor: address.floor ? validator.escape(address.floor) : "",
        city: validator.escape(address.city),
        province: validator.escape(address.province),
        postalCode: validator.escape(address.postalCode),
      };
    }

    // Guardar
    await user.save();

    // Respuesta
    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dni: user.dni,
        whatsapp: user.whatsapp,
        birthdate: user.birthdate,
        address: user.address,
      },
    });

  } catch (err) {
    console.error("Error actualizando perfil");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// ACTUALIZAR AVATAR DE USUARIO
// ===============================
export async function updateUserAvatar(req, res) {
  try {
    const { id } = req.params;

    // Verificar que el usuario sea propietario
    if (req.user.id !== id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Verificar que se subió archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    // Buscar usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "hellocomfy/avatars",
      resource_type: "auto",
      quality: "auto",
    });

    // Actualizar avatar
    user.avatar = result.secure_url;
    await user.save();

    // Respuesta
    res.json({
      message: "Avatar actualizado correctamente",
      avatar: user.avatar,
    });

  } catch (err) {
    console.error("Error actualizando avatar");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// VERIFICAR EMAIL
// ===============================
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token de verificación requerido" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: "Email verificado correctamente. Ya podés iniciar sesión." });
  } catch (err) {
    console.error("Error verificando email:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ===============================
// REENVIAR EMAIL DE VERIFICACIÓN
// ===============================
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // No revelar si el email existe o no
      return res.json({ message: "Si el email existe, se envió un nuevo enlace de verificación." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Este email ya está verificado" });
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await enviarEmailVerificacion(user.email, user.name, verificationToken);

    res.json({ message: "Se envió un nuevo enlace de verificación a tu email." });
  } catch (err) {
    console.error("Error reenviando verificación:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

