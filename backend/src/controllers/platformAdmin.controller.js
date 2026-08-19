
import { findAdminByEmail } from '../models/platformAdmin.model.js';
import { comparePassword } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

// POST /admin/login — completely separate from tenant /auth/login.
// Deliberately not reusing generateToken() from auth.service.js, because that function's shape assumes storeId/tenant role always exist — forcing platform-admin data through it would mean faking those fields, which defeats the whole point of keeping this isolated.
export async function adminLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = await findAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await comparePassword(password, admin.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { adminId: admin.admin_id, accountType: 'SUPER_ADMIN' }, // no role, no storeId — intentionally
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    admin: { id: admin.admin_id, name: admin.name, email: admin.email },
  });
}