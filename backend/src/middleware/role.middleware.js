//
// Restricts a route to specific roles. Must run AFTER authenticate,
// since it reads req.user set by the JWT check.
 
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
 
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden — this action requires one of: ${allowedRoles.join(', ')}`,
      });
    }
 
    next();
  };
}
 
export function requireOwnStore(req, res, next) {
  if (req.user.accountType === 'SUPER_ADMIN') return next();
 
  if (req.params.storeId && req.params.storeId !== req.user.storeId) {
    return res.status(403).json({ error: 'Forbidden — not your store' });
  }
  next();
}