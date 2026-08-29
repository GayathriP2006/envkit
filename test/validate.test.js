import { test } from 'node:test';
import assert from 'node:assert';
import { validateSchema } from '../lib/validate.js';

test('passes when all required fields present and valid', () => {
  const result = validateSchema(
    { PORT: '3000', API_KEY: 'abc' },
    { PORT: { type: 'number', required: true }, API_KEY: { type: 'string', required: true } }
  );
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
});

test('fails when required field missing', () => {
  const result = validateSchema(
    {},
    { API_KEY: { type: 'string', required: true } }
  );
  assert.strictEqual(result.valid, false);
  assert.match(result.errors[0], /required but missing/);
});

test('fails on wrong number type', () => {
  const result = validateSchema(
    { PORT: 'not-a-number' },
    { PORT: { type: 'number', required: true } }
  );
  assert.strictEqual(result.valid, false);
  assert.match(result.errors[0], /expected number/);
});

test('applies default when value missing', () => {
  const result = validateSchema(
    {},
    { NODE_ENV: { type: 'enum', values: ['dev', 'prod'], default: 'dev' } }
  );
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.values.NODE_ENV, 'dev');
});

test('fails on invalid enum value', () => {
  const result = validateSchema(
    { NODE_ENV: 'staging' },
    { NODE_ENV: { type: 'enum', values: ['dev', 'prod'] } }
  );
  assert.strictEqual(result.valid, false);
  assert.match(result.errors[0], /expected one of/);
});

test('fails on invalid url', () => {
  const result = validateSchema(
    { API_URL: 'not a url' },
    { API_URL: { type: 'url', required: true } }
  );
  assert.strictEqual(result.valid, false);
  assert.match(result.errors[0], /invalid URL/);
});

test('passes on valid url', () => {
  const result = validateSchema(
    { API_URL: 'https://example.com' },
    { API_URL: { type: 'url', required: true } }
  );
  assert.strictEqual(result.valid, true);
});

test('collects multiple errors instead of stopping at first', () => {
  const result = validateSchema(
    {},
    {
      A: { type: 'string', required: true },
      B: { type: 'string', required: true }
    }
  );
  assert.strictEqual(result.errors.length, 2);
});