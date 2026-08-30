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
test('handles = sign inside quoted value', () => {
  const result = parseEnv('URL="http://example.com?a=1&b=2"');
  assert.strictEqual(result.URL, 'http://example.com?a=1&b=2');
});

test('handles escaped double quotes inside quoted value', () => {
  const result = parseEnv('MSG="She said \\"hello\\""');
  assert.strictEqual(result.MSG, 'She said "hello"');
});

test('handles empty value', () => {
  const result = parseEnv('EMPTY=');
  assert.strictEqual(result.EMPTY, '');
});

test('handles empty quoted value', () => {
  const result = parseEnv('EMPTY=""');
  assert.strictEqual(result.EMPTY, '');
});

test('handles value with spaces when quoted', () => {
  const result = parseEnv('NAME="John Doe"');
  assert.strictEqual(result.NAME, 'John Doe');
});

test('handles key with underscores and numbers', () => {
  const result = parseEnv('MY_VAR_2=test');
  assert.strictEqual(result.MY_VAR_2, 'test');
});

test('ignores leading blank lines and trailing whitespace-only lines', () => {
  const result = parseEnv('\n\n  \nPORT=3000\n   \n');
  assert.strictEqual(result.PORT, '3000');
});
test('single-quoted values keep \\n literal, not expanded', () => {
  const result = parseEnv("KEY='dontexpand\\nnewlines'");
  assert.strictEqual(result.KEY, 'dontexpand\\nnewlines');
});

test('double-quoted values expand \\n into real newline', () => {
  const result = parseEnv('KEY="expand\\nnewlines"');
  assert.strictEqual(result.KEY, 'expand\nnewlines');
});