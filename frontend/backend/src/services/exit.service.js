
import { findReceiptByQrCode, markReceiptCollected } from '../models/receipt.model.js';
import { verifyReceiptSignature } from '../utils/hmac.util.js';
import { listItemsForTransaction } from '../models/sale.model.js';
import { logDuplicateScan } from '../models/discrepancyLog.model.js';

export async function validateExit(qrCode, guardUserId) {
  // Step 1: split and cryptographically verify BEFORE touching the database.
  // A malformed or forged QR code gets rejected here, cheaply, without
  // ever running a query.
  const [saleId, signature] = qrCode.split('.');
  if (!saleId || !signature || !verifyReceiptSignature(saleId, signature)) {
    throw { status: 400, message: 'Invalid or tampered QR code' };
  }

  // Step 2: does this receipt actually exist?
  const receipt = await findReceiptByQrCode(qrCode);
  if (!receipt) {
    throw { status: 404, message: 'Receipt not found' };
  }

  // Step 3: is it still PENDING? Try to atomically flip it to COLLECTED.
  const updated = await markReceiptCollected(qrCode, guardUserId);

  if (!updated) {
    // markReceiptCollected returned undefined -> it was already COLLECTED.
    // THIS is the fraud moment. Log it, then tell the caller to block exit.
    await logDuplicateScan({ receiptId: receipt.receipt_id, scannedBy: guardUserId });
    throw { status: 409, message: 'Receipt already collected — possible fraud', alreadyCollected: true };
  }

  // Success path: return the item list so Security can visually confirm
  // the bag matches, same as the "Show item checklist" step in your
  // sequence diagram.
  const items = await listItemsForTransaction(receipt.transaction_id);
  return { receipt: updated, items };
}