// Placeholder middleware for validating producto
const validateProducto = (req, res, next) => {
  const { body } = req;

  // Validate that req.body exists and is an object
  if (!body || typeof body !== 'object') {
    const err = new Error("Datos incompletos");
    err.status = 400;
    return next(err);
  }

  const { nombre, precio, stock, categoria } = body;

  // Validate required fields
  if (typeof nombre !== 'string' || !nombre.trim()) {
    const err = new Error("Datos incompletos");
    err.status = 400;
    return next(err);
  }

  if (typeof precio !== 'number' || precio <= 0) {
    const err = new Error("Datos incompletos");
    err.status = 400;
    return next(err);
  }

  // Validate optional fields
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    const err = new Error("Datos incompletos");
    err.status = 400;
    return next(err);
  }

  if (categoria !== undefined && (typeof categoria !== 'string' || !categoria.trim())) {
    const err = new Error("Datos incompletos");
    err.status = 400;
    return next(err);
  }

  next();
};

export default validateProducto;