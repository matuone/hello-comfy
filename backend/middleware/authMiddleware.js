import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log removido por seguridad
  const token = authHeader?.split(" ")[1];

  if (!token) {
    // console.log removido por seguridad
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log removido por seguridad
    // Guardamos los datos del usuario en req.user
    req.user = decoded;
    next();
  } catch (err) {
    // console.log removido por seguridad
    return res.status(401).json({ error: "Token inválido" });
  }
}
