import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("No autorizado");
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, rol }
    next();
  } catch (error) {
    const err = new Error("Token inválido");
    err.status = 401;
    next(err);
  }
}