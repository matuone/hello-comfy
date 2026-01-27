import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("[authMiddleware] Authorization header:", authHeader);
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("[authMiddleware] Token no proporcionado");
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authMiddleware] Token decodificado:", decoded);
    // Guardamos los datos del usuario en req.user
    req.user = decoded;
    next();
  } catch (err) {
    console.log("[authMiddleware] Token inválido:", err.message);
    return res.status(401).json({ error: "Token inválido" });
  }
}
