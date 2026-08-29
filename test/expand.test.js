
import { test } from 'node:test';
import assert from 'node:assert';
import { parseEnv } from '../lib/parser.js';

test('parses simple key=value', () => {
  const result = parseEnv('PORT=3000');
  assert.strictEqual(result.PORT, '3000');
});

test('ignores comments and blank lines', () => {
  const result = parseEnv('# comment\n\nPORT=3000');
  assert.strictEqual(result.PORT, '3000');
});

test('strips double quotes', () => {
  const result = parseEnv('KEY="hello world"');
  assert.strictEqual(result.KEY, 'hello world');
});

test('strips single quotes', () => {
  const result = parseEnv("KEY='hello world'");
  assert.strictEqual(result.KEY, 'hello world');
});

test('handles multiple lines', () => {
  const result = parseEnv('A=1\nB=2\nC=3');
  assert.deepStrictEqual(result, { A: '1', B: '2', C: '3' });
});

test('trims whitespace around key and value', () => {
  const result = parseEnv('  PORT = 3000  ');
  assert.strictEqual(result.PORT, '3000');
});

test('throws on line with no equals sign', () => {
  assert.throws(() => parseEnv('NOVALUEHERE'), /Parse error on line 1/);
});

test('strips trailing inline comment on unquoted value', () => {
  const result = parseEnv('PORT=3000 # the port');
  assert.strictEqual(result.PORT, '3000');
});