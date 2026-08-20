//This file handles the actual security logic for authentication, [Hashing passwords, creating/verifying JWT]
 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
 
const SALT_ROUNDS = 10; // industry-standard default.
 
// Hashes a plain-text password before it's ever saved to the database.
// Called once, at signup/account-creation time.
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}
 
// Compares a plain-text password (what the user just typed at login), against the hash stored in the database. Returns true/false.
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
 
// Creates a JWT after successful login. Everything in this payload but cant be edited
export function generateToken({ userId, role, storeId }) {
  return jwt.sign(
    { userId, role, storeId, accountType: 'TENANT' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' } // matches a typical work shift — tune this later if needed
  );
}