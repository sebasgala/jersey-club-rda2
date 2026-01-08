const requireAdmin = (req, res, next) => {
  // Check if user is not authenticated or not an admin (supports role or rol)
  if (!req.user || (req.user.role !== 'admin' && req.user.rol !== 'admin')) {
    const err = new Error('Prohibido');
    err.status = 403;
    return next(err);
  }

  next();
};

export default requireAdmin;