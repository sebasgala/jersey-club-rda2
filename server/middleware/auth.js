/**
 * =====================================================
 * MIDDLEWARE: authContext por cabeceras
 * =====================================================
 * Lee x-user-id y x-user-rol de los headers
 * NO usa JWT - autenticación simplificada por cabeceras
 */

export function authenticate(req, res, next) {
  const id = req.headers['x-user-id'];
  const rol = req.headers['x-user-rol'];

  if (id && rol) {
    req.user = { id: Number(id), rol };
  } else {
    req.user = null;
  }

  next();
}

export function optionalAuth(req, res, next) {
  const id = req.headers['x-user-id'];
  const rol = req.headers['x-user-rol'];

  if (id && rol) {
    req.user = { id: Number(id), rol };
  }

  next();
}

export default authenticate;
