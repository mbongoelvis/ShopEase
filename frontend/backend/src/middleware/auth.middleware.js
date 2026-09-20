
// Verifies the JWT on every protected request and attaches the decoded
// payload to req.user. Does NOT check role — that's role.middleware.js's
// job, kept separate so routes can mix "must be logged in" with
// "must be a specific role" independently.
 
import jwt from 'jsonwebtoken';
 
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"
 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
 
  const token = authHeader.split(' ')[1];
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, storeId, accountType, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}