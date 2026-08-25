
// Controllers handle the HTTP layer: read the request, call the
// model/service functions that do the real work, shape the response.
// No SQL here, no bcrypt/JWT logic here — just orchestration.

import { findUserByEmail, findUserById, createUser, updatePassword } from '../models/user.model.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
import { generateTempPassword } from '../utils/password.util.js';
import pool from '../config/db.js';
 
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
      mustResetPassword: user.must_reset_password,
    },
  });
}
 
// POST /employees — Owner-only (enforced by middleware on the route, not here).
// Creates a new tenant employee account.
export async function createEmployee(req, res) {
  const { name, email, role } = req.body;
 
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email, and role are required' });
  }
 
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
 
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
 
  const newUser = await createUser({
    name,
    email,
    passwordHash,
    role,
    storeId: req.user.storeId,
    mustResetPassword: true
    // the Owner's OWN store — taken from their token, never from the request body
  });
 
  res.status(201).json({ user: newUser, tempPassword });
}

// PATCH /auth/change-password — any logged-in user, changes their own password.
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
 
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
 
  // req.user comes from the decoded JWT, which only contains
  // { userId, role, storeId, accountType } — NOT email. So we must look
  // the user up by ID, not by email, to get their password_hash.
  // findUserById as originally written strips password_hash from its
  // SELECT (correct for most uses, e.g. returning a profile) — but here
  // we NEED the hash to verify currentPassword, so we query it directly.
  const result = await pool.query(
    'SELECT * FROM user_account WHERE user_id = $1',
    [req.user.userId]
  );
  const user = result.rows[0];
 
  const passwordMatches = await comparePassword(currentPassword, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
 
  const newHash = await hashPassword(newPassword);
  const updated = await updatePassword(req.user.userId, newHash);
 
  res.json({ message: 'Password updated successfully', user: updated });
}