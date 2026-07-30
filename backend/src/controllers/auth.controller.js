
// Controllers handle the HTTP layer: read the request, call the
// model/service functions that do the real work, shape the response.
// No SQL here, no bcrypt/JWT logic here — just orchestration.
 
import { findUserByEmail, createUser } from '../models/user.model.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
 
// POST /auth/login — open to any valid user, any role.
export async function login(req, res) {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
 
  const user = await findUserByEmail(email);
  if (!user) {
    // Deliberately vague — never confirm "email not found" vs "wrong password"
    // separately. That distinction helps an attacker enumerate valid emails.
    return res.status(401).json({ error: 'Invalid email or password' });
  }
 
  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
 
  const token = generateToken({
    userId: user.user_id,
    role: user.role,
    storeId: user.store_id,
  });
 
  res.json({
    token,
    user: {
      id: user.user_id,
      name: user.user_name,
      role: user.role,
    },
  });
}
 
// POST /employees — Owner-only (enforced by middleware on the route, not here).
// Creates a new tenant employee account.
export async function createEmployee(req, res) {
  const { name, email, password, role } = req.body;
 
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required' });
  }
 
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
 
  const passwordHash = await hashPassword(password);
 
  const newUser = await createUser({
    name,
    email,
    passwordHash,
    role,
    storeId: req.user.storeId, // the Owner's OWN store — taken from their token, never from the request body
  });
 
  res.status(201).json({ user: newUser });
}