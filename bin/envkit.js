#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parseEnv } from '../lib/parser.js';
import { expandVars } from '../lib/expand.js';
import { validateSchema } from '../lib/validate.js';
import { diffEnv } from '../lib/diff.js';
import { color } from '../lib/output.js';

const [, , command, ...rest] = process.argv;
const HELP_TEXT = `envkit — zero-dependency .env toolkit

Usage:
  envkit init             Create a starter .env.schema.json
  envkit check            Validate your .env file against the schema
  envkit run -- <cmd>     Validate, then run a command with the env loaded
  envkit diff             Compare .env against .env.example, flag mismatches
  envkit diff --strict    Same as diff, but exits with error on extra keys too
  envkit --help           Show this help text

Examples:
  envkit check
  envkit run -- node app.js
  envkit diff --strict
`;

function loadEnvAndSchema() {
  const envPath = path.resolve('.env');
  const schemaPath = path.resolve('.env.schema.json');

  if (!fs.existsSync(envPath)) {
    console.error(color('No .env file found in current directory.', 'red'));
    process.exit(1);
  }
  if (!fs.existsSync(schemaPath)) {
    console.error(color('No .env.schema.json file found. Run "envkit init" first.', 'red'));
    process.exit(1);
  }

  const parsed = parseEnv(fs.readFileSync(envPath, 'utf8'));
  const expanded = expandVars(parsed);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  return validateSchema(expanded, schema);
}

if (command === 'check') {
  const result = loadEnvAndSchema();
  if (result.valid) {
    console.log(color('✔ .env is valid', 'green'));
  } else {
    console.log(color('✘ .env has errors:', 'red'));
    result.errors.forEach(e => console.log(color(`  - ${e}`, 'yellow')));
    process.exit(1);
  }

} else if (command === 'run') {
  const result = loadEnvAndSchema();
  if (!result.valid) {
    console.log(color('✘ Cannot run — .env has errors:', 'red'));
    result.errors.forEach(e => console.log(color(`  - ${e}`, 'yellow')));
    process.exit(1);
  }
  const sepIndex = rest.indexOf('--');
  const cmdArgs = sepIndex !== -1 ? rest.slice(sepIndex + 1) : rest;
  if (cmdArgs.length === 0) {
    console.error(color('No command given. Usage: envkit run -- <command>', 'red'));
    process.exit(1);
  }
  const child = spawn(cmdArgs[0], cmdArgs.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, ...result.values }
  });
  child.on('exit', code => process.exit(code));

} else if (command === 'init') {
  const schemaPath = path.resolve('.env.schema.json');
  if (fs.existsSync(schemaPath)) {
    console.log(color('.env.schema.json already exists.', 'yellow'));
  } else {
    fs.writeFileSync(schemaPath, JSON.stringify({
      PORT: { type: 'number', required: true },
      API_KEY: { type: 'string', required: true },
      NODE_ENV: { type: 'enum', values: ['dev', 'prod'], default: 'dev' }
    }, null, 2));
    console.log(color('Created .env.schema.json', 'green'));
  }

} else if (command === 'diff') {
  const strict = rest.includes('--strict');
  const envPath = path.resolve('.env');
  const examplePath = path.resolve('.env.example');

  if (!fs.existsSync(envPath)) {
    console.error(color('No .env file found.', 'red'));
    process.exit(1);
  }
  if (!fs.existsSync(examplePath)) {
    console.error(color('No .env.example file found. Create one to diff against.', 'red'));
    process.exit(1);
  }

  const actual = parseEnv(fs.readFileSync(envPath, 'utf8'));
  const example = parseEnv(fs.readFileSync(examplePath, 'utf8'));
  const result = diffEnv(Object.keys(actual), Object.keys(example));

  console.log(color(`envkit diff — ${result.summary}`, result.inSync ? 'green' : 'yellow'));
  console.log('');

  if (result.missing.length > 0) {
    console.log(color('Missing (required by .env.example, not set in .env):', 'red'));
    result.missing.forEach(k => console.log(color(`  ✘ ${k}`, 'red')));
    console.log('');
  }

  if (result.extra.length > 0) {
    const label = strict
      ? color('Extra (flagged as errors in --strict mode):', 'red')
      : color('Extra (in .env, not in .env.example):', 'cyan');
    console.log(label);
    result.extra.forEach(k => console.log(color(`  ${strict ? '✘' : '+'} ${k}`, strict ? 'red' : 'cyan')));
    console.log('');
  }

  if (result.inSync) {
    process.exit(0);
  } else if (result.missing.length > 0 || (strict && result.extra.length > 0)) {
    process.exit(1);
  } else {
    process.exit(0);
  } }else if (command === '--help' || command === '-h' || !command) {
  console.log(HELP_TEXT);

} else {
  console.log(color(`Unknown command: ${command}`, 'red'));
  console.log(HELP_TEXT);
  process.exit(1);
}