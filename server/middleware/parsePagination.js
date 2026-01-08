// Middleware para analizar la paginación
const parsePagination = (req, res, next) => {
  const { page = 1, limit = 20, categoria, sort } = req.query;

  // Convertir página y límite a números
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // Validar parámetros de paginación
  if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
    const err = new Error("Parámetros de paginación inválidos");
    err.status = 400;
    return next(err);
  }

  // Construir el objeto listQuery
  req.listQuery = {
    page: pageNumber,
    limit: limitNumber,
    categoria,
    sort,
  };

  next();
};

export default parsePagination;