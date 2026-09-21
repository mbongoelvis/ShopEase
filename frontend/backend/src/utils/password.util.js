
import crypto from 'crypto';

// Generates a random, readable temporary password — e.g. "Xk4mQ9pR".
// Uses crypto.randomBytes (cryptographically secure) rather than
// Math.random(), which is NOT safe for anything security-related —
// Math.random() is predictable enough to be guessed under the right
// conditions, which matters here since this literally becomes someone's
// real (temporary) login credential.
export function generateTempPassword(length = 10) {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '') // strip symbols base64 can include, keep it easy to type/read
    .slice(0, length);
}