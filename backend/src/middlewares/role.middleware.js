/**
 * Middleware de contrôle de rôle.
 * Usage : roleMiddleware('admin')  ou  roleMiddleware('admin', 'medecin')
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit : rôle insuffisant' });
    }
    next();
  };
};

module.exports = roleMiddleware;
