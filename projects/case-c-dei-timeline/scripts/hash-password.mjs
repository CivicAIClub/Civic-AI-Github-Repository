#!/usr/bin/env node
/* eslint-disable no-console */

// One-shot CLI for generating an `ADMIN_PASSWORD_HASH` value to paste into
// Vercel project env vars (and `.env.local` for local development).
//
//   $ node scripts/hash-password.mjs <password>
//
// The plaintext password is read from argv[2] so it doesn't end up in shell
// history if you use a heredoc / read-pipe in a real ops workflow:
//
//   $ printf "supersecret\n" | xargs -I {} node scripts/hash-password.mjs {}
//
// Output: a single bcrypt hash on stdout, ready to copy into the env var.

import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>');
  console.error('Set the resulting hash as ADMIN_PASSWORD_HASH in your env.');
  process.exit(1);
}

if (password.length < 12) {
  console.error('Refusing to hash a password under 12 characters. Pick something stronger.');
  process.exit(1);
}

// 12 rounds gives ~250ms per verify on modern hardware — slow enough to thwart
// offline brute-force, fast enough that an admin's login feels instant.
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
console.log(hash);
