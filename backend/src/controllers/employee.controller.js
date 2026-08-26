import pool from '../config/db.js';
import { hashPassword } from '../services/auth.service.js';

export async function getEmployees(req, res) {
  try {
    const storeId = req.user.storeId;

    const result = await pool.query(
      'SELECT user_id, user_name, email, role, store_id, created_at FROM user_account WHERE store_id = $1 AND role != $2 ORDER BY created_at DESC',
      [storeId, 'OWNER']
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

// DELETE employee account (OWNER only)
export async function deleteEmployee(req, res) {
  try {
    const { employeeId } = req.params;
    const storeId = req.user.storeId;

    // Verify employee belongs to this store
    const employeeResult = await pool.query(
      'SELECT user_id, store_id FROM user_account WHERE user_id = $1 AND store_id = $2',
      [employeeId, storeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found or not in your store' });
    }

    // Delete employee
    await pool.query(
      'DELETE FROM user_account WHERE user_id = $1',
      [employeeId]
    );

    res.json({ message: 'Employee account deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
}

// RESET employee password (OWNER only)
export async function resetEmployeePassword(req, res) {
  try {
    const { employeeId } = req.params;
    const storeId = req.user.storeId;

    // Verify employee belongs to this store
    const employeeResult = await pool.query(
      'SELECT user_id, user_name, email, store_id FROM user_account WHERE user_id = $1 AND store_id = $2',
      [employeeId, storeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeeResult.rows[0];

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword);

    // Update password and set mustResetPassword flag
    await pool.query(
      'UPDATE user_account SET password_hash = $1, must_reset_password = true WHERE user_id = $2',
      [passwordHash, employeeId]
    );

    res.json({
      message: 'Password reset successfully',
      employeeName: employee.user_name,
      temporaryPassword: tempPassword,
      email: employee.email
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
