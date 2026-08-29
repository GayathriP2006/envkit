#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parseEnv } from '../lib/parser.js';
import { expandVars } from '../lib/expand.js';
import { validateSchema } from '../lib/validate.js';
import { color } from '../lib/output.js';

const [, , command, ...rest] = process.argv;

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

} else {
  console.log(`envkit — zero-dependency .env toolkit

Usage:
  envkit init             Create a starter .env.schema.json
  envkit check            Validate your .env file
  envkit run -- <cmd>     Validate, then run a command with the env loaded
`);
}