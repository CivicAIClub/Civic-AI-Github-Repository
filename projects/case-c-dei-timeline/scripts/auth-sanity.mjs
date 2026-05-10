// Sanity check for verifySessionToken malformed-input handling.
// Run with: SESSION_SECRET='...' node --experimental-vm-modules ... or via tsx.
process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long-yes';

const { createSessionToken, verifySessionToken } = await import('../lib/auth.ts');

let pass = 0, fail = 0;
async function expectNull(label, token) {
  try {
    const result = await verifySessionToken(token);
    if (result === null) { console.log(`  ✓ ${label}`); pass++; }
    else { console.log(`  ✗ ${label} — expected null, got`, result); fail++; }
  } catch (err) {
    console.log(`  ✗ ${label} — THREW:`, err.message); fail++;
  }
}

await expectNull('junk in sig (bad base64 chars)', 'abc.def.@#$%');
await expectNull('junk in username segment',     '@#$.def.ghi=');
await expectNull('one-part token',               'just-one-part');
await expectNull('two-part token',               'one.two');
await expectNull('empty cookie',                 '');
await expectNull('null cookie',                  null);
await expectNull('undefined cookie',             undefined);
await expectNull('forged sig (valid base64, wrong HMAC)', 'YWRtaW4.MTcwMDAwMDAwMDAwMA.deadbeef');

// Positive control
const tok = await createSessionToken('admin');
const sess = await verifySessionToken(tok);
if (sess && sess.username === 'admin') { console.log('  ✓ round-trip verifies a real token'); pass++; }
else { console.log('  ✗ round-trip — got', sess); fail++; }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
