
import { validateExit } from '../services/exit.service.js';

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
    // Our service throws { status, message } objects on purpose (see
    // exit.service.js) so the controller can map them straight to the
    // correct HTTP status instead of always returning 500.
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Something went wrong',
      alreadyCollected: err.alreadyCollected || false,
    });
  }
}