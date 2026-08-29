import { test } from 'node:test';
import assert from 'node:assert';
import { expandVars } from '../lib/expand.js';

test('expands a simple reference', () => {
  const result = expandVars({ HOST: 'localhost', URL: '${HOST}/api' });
  assert.strictEqual(result.URL, 'localhost/api');
});

test('leaves plain values unchanged', () => {
  const result = expandVars({ PORT: '3000' });
  assert.strictEqual(result.PORT, '3000');
});

test('expands multiple references in one value', () => {
  const result = expandVars({ A: 'foo', B: 'bar', C: '${A}-${B}' });
  assert.strictEqual(result.C, 'foo-bar');
});

test('resolves nested/chained references', () => {
  const result = expandVars({ A: 'base', B: '${A}-mid', C: '${B}-top' });
  assert.strictEqual(result.C, 'base-mid-top');
});

test('throws on circular reference', () => {
  assert.throws(
    () => expandVars({ A: '${B}', B: '${A}' }),
    /Circular reference detected/
  );
});

test('replaces unknown reference with empty string', () => {
  const result = expandVars({ URL: '${UNKNOWN}/path' });
  assert.strictEqual(result.URL, '/path');
});