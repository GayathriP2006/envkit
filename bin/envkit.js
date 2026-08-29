#!/usr/bin/env node
import { parseEnv } from '../lib/parser.js';
import { expandVars } from '../lib/expand.js';
import { validateSchema } from '../lib/validate.js';
import { color } from '../lib/output.js';

const [, , command] = process.argv;

// TODO: wire up 'check', 'run', 'init' subcommands
console.log(color(`envkit command: ${command}`, 'cyan'));
