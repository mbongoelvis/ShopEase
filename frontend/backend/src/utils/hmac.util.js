// HMAC-SHA256 explained simply: it's a way to prove a piece of data (here, a receipt ID) hasn't been tampered with, WITHOUT needing to look anything up in a database first.
 
//  You feed it a secret key + the data, it produces a signature. Anyone with the same secret key can re-run the same calculation and check the signature still matches. 

// nobody WITHOUT the key can forge a valid signature, even if they can see the receipt ID itself (e.g. by guessing UUIDs).
// This makes our QR Code trustworthy, proves that our backend generated it.

import crypto from 'crypto';

const HMAC_SECRET = process.env.QR_HMAC_SECRET; // separate from JWT_SECRET — different purpose, different key

// Produces a signature for a given sale_id. This becomes part of the QR payload.
export function signReceipt(saleId) {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(saleId)
    .digest('hex');
}

// Re-computes the expected signature and compares it to what's in the scanned QR code. Returns true only if they match exactly.
export function verifyReceiptSignature(saleId, providedSignature) {
  const expectedSignature = signReceipt(saleId);

  // timingSafeEqual instead of === : a normal string comparison exits
  // early on the first mismatched character, which means comparison
  // TIME leaks information about how much of the signature is correct —
  // an attacker could theoretically guess a signature one byte at a
  // time by measuring response speed. timingSafeEqual always takes the
  // same time regardless of where the mismatch is, closing that gap.
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(providedSignature, 'hex');

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}