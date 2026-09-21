
import { validateExit } from '../services/exit.service.js';
import pool from '../config/db.js';
import { logDiscrepancy } from '../models/discrepancyLog.model.js';
import { findReceiptByQrCode } from '../models/receipt.model.js';

// POST /exit/validate — Security Guard only.
export async function validateExitScan(req, res) {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ error: 'qrCode is required' });
  }

  try {
    const result = await validateExit(qrCode, req.user.userId);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Something went wrong',
      alreadyCollected: err.alreadyCollected || false,
    });
  }
}

// GET /exit/history — recent verifications for this store, focused on this guard.
export async function getExitHistory(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         r.receipt_id,
         r.qr_code,
         r.status AS receipt_status,
         r.collected_at,
         r.validated_by,
         st.sale_id,
         st.total,
         st.timestamp,
         (SELECT COUNT(*) FROM sale_item si WHERE si.transaction_id = st.sale_id) AS item_count
       FROM receipt r
       JOIN sale_transaction st ON r.transaction_id = st.sale_id
       WHERE st.store_id = $1
         AND (r.validated_by = $2 OR r.status = 'PENDING')
       ORDER BY COALESCE(r.collected_at, st.timestamp) DESC
       LIMIT 50`,
      [req.user.storeId, req.user.userId]
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const statsResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE r.validated_by = $2 AND r.collected_at >= $3) AS scanned_today,
         COUNT(*) FILTER (WHERE r.validated_by = $2 AND r.status = 'COLLECTED' AND r.collected_at >= $3) AS cleared_today
       FROM receipt r
       JOIN sale_transaction st ON r.transaction_id = st.sale_id
       WHERE st.store_id = $1`,
      [req.user.storeId, req.user.userId, todayStart.toISOString()]
    );

    const flagsResult = await pool.query(
      `SELECT COUNT(*)::int AS flagged_today
       FROM discrepancy_log dl
       WHERE dl.scanned_by = $1 AND dl.detected_at >= $2`,
      [req.user.userId, todayStart.toISOString()]
    );

    res.json({
      history: result.rows,
      stats: {
        scannedToday: Number(statsResult.rows[0]?.scanned_today || 0),
        cleared: Number(statsResult.rows[0]?.cleared_today || 0),
        flagged: Number(flagsResult.rows[0]?.flagged_today || 0),
      },
    });
  } catch (err) {
    console.error('Error fetching exit history:', err);
    res.status(500).json({ error: 'Failed to fetch exit history' });
  }
}

// POST /exit/report — guard reports a bag/receipt mismatch.
export async function reportExitDiscrepancy(req, res) {
  const { qrCode, reason } = req.body;
  if (!reason) {
    return res.status(400).json({ error: 'reason is required' });
  }

  try {
    let receiptId = null;
    if (qrCode) {
      const receipt = await findReceiptByQrCode(qrCode);
      receiptId = receipt?.receipt_id || null;
      if (receiptId) {
        await logDiscrepancy({
          receiptId,
          scannedBy: req.user.userId,
          reason: reason.slice(0, 500),
        });
      }
    }

    res.json({ ok: true, receiptId });
  } catch (err) {
    console.error('Error reporting discrepancy:', err);
    res.status(500).json({ error: 'Failed to report discrepancy' });
  }
}