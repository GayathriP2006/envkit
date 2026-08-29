import { test } from 'node:test';
import assert from 'node:assert';
import { diffEnv } from '../lib/diff.js';

test('reports in sync when keys match exactly', () => {
  const result = diffEnv(['PORT', 'API_KEY'], ['PORT', 'API_KEY']);
  assert.strictEqual(result.inSync, true);
  assert.deepStrictEqual(result.missing, []);
  assert.deepStrictEqual(result.extra, []);
});

test('reports missing keys present in example but not actual', () => {
  const result = diffEnv(['PORT'], ['PORT', 'API_KEY']);
  assert.strictEqual(result.inSync, false);
  assert.deepStrictEqual(result.missing, ['API_KEY']);
  assert.deepStrictEqual(result.extra, []);
});

test('reports extra keys present in actual but not example', () => {
  const result = diffEnv(['PORT', 'DEBUG'], ['PORT']);
  assert.strictEqual(result.inSync, false);
  assert.deepStrictEqual(result.missing, []);
  assert.deepStrictEqual(result.extra, ['DEBUG']);
});

test('reports both missing and extra simultaneously', () => {
  const result = diffEnv(['PORT', 'DEBUG'], ['PORT', 'API_KEY']);
  assert.deepStrictEqual(result.missing, ['API_KEY']);
  assert.deepStrictEqual(result.extra, ['DEBUG']);
});