/**
 * Middleware: Auth Context
 * - Lee x-user-id y x-user-rol de los headers
 * - Construye req.user con id y rol
 * - Si no hay headers, req.user = null (usuario no autenticado)
 */
const authContext = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRol = req.headers['x-user-rol'];

  if (userId) {
    req.user = {
      id: userId,
      rol: userRol || 'user'
    };
  } else {
    req.user = null;
  }

  next();
};

export default authContext;