const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');

test('Both hero logo variants are byte-for-byte original assets', () => {
  for (const file of ['assets/logo/gradient.svg', 'assets/logo/moderne-dark.svg']) {
    const original = execFileSync('git', ['show', `a9dfd3c:${file}`], { cwd: root });
    assert.deepEqual(fs.readFileSync(path.join(root, file)), original, `${file} must not be redrawn or recoloured`);
  }
});
