
import { findAdminByEmail, updateAdminPassword } from '../models/platformAdmin.model.js';
import { comparePassword, hashPassword } from '../services/auth.service.js';
import { generateTempPassword } from '../utils/password.util.js';
import { sendPaymentReminder, sendPasswordResetEmail } from '../services/email.service.js';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

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

// POST /admin/send-payment-reminder — send payment reminder email to tenant's owner
export async function sendPaymentReminderEmail(req, res) {
  try {
    const { storeId, tenantName, amount, tone } = req.body;

    if (!storeId || !tenantName || !amount) {
      return res.status(400).json({ error: 'storeId, tenantName, and amount are required' });
    }

    // Get owner's email from user_account table
    const ownerResult = await pool.query(
      `SELECT email FROM user_account WHERE store_id = $1 AND role = 'OWNER' LIMIT 1`,
      [storeId]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found for this store' });
    }

    const ownerEmail = ownerResult.rows[0].email;
    const result = await sendPaymentReminder(ownerEmail, tenantName, amount, tone || 'Friendly');

    res.json({
      message: 'Payment reminder email sent successfully',
      messageId: result.messageId
    });
  } catch (err) {
    console.error('Error sending payment reminder:', err);
    res.status(500).json({ error: 'Failed to send payment reminder email' });
  }
}

// POST /admin/request-password-reset — admin requests password reset
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { adminId: admin.admin_id, type: 'PASSWORD_RESET' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, this would be a frontend URL like https://yourdomain.com/admin/reset-password
    const resetLink = `http://localhost:5173/admin/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetLink, admin.name);

    res.json({ message: 'Password reset link has been sent to your email' });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
}

// POST /admin/reset-password — admin resets password with token
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Reset link has expired or is invalid' });
    }

    if (decoded.type !== 'PASSWORD_RESET') {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    // Hash new password and update
    const passwordHash = await hashPassword(newPassword);
    const admin = await updateAdminPassword(decoded.adminId, passwordHash);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
