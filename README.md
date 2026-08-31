# envkit

A zero-dependency replacement for `dotenv` + `dotenv-expand` + schema validation (`zod`/`envalid`) — built entirely on Node.js's standard library. No `npm install` required, ever.

# envkit

![Tests](https://github.com/GayathriP2006/envkit/actions/workflows/test.yml/badge.svg)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/GayathriP2006/envkit)

## Live Demo
Try it in your browser: **https://gayathrip2006.github.io/envkit/**

## The Problem

Every Node.js project that uses `.env` files typically installs 3+ separate packages:
- `dotenv` — to load the `.env` file
- `dotenv-expand` — to let variables reference each other
- `zod` / `envalid` / `joi` — to validate required variables are set correctly

Each of these packages pulls in its own dependency tree — code from strangers, updated without your review, sitting in your `node_modules`. envkit does all three jobs with zero installed packages.

## What It Does

- **Parses** `.env` files (comments, quotes, multiline-safe values)
- **Expands** `${VAR}` references between variables, with circular-reference detection
- **Validates** your environment against a schema — required fields, types, defaults, enums, URLs
- **Runs** your app only if validation passes, via a single CLI command

## Installation

Since envkit has zero dependencies, there's no npm registry package to install —
you clone and link your own copy directly.

```bash
git clone https://github.com/GayathriP2006/envkit.git
cd envkit
npm link
```

This makes `envkit` available as a command anywhere on your machine, without
downloading anything from the npm registry. `npm link` is part of npm itself —
it just symlinks this folder so you can call it globally.

Now use it in any project:

```bash
cd your-project
envkit init
envkit check
envkit run -- node app.js
```

If you'd rather not install it globally, you can also run it directly:

```bash
node /path/to/envkit/bin/envkit.js check
```

## How To Run It

```bash
git clone https://github.com/GayathriP2006/envkit.git
cd envkit

# Create a starter schema
node bin/envkit.js init

# Validate your .env file against .env.schema.json
node bin/envkit.js check

# Validate, then run your app with the env loaded
node bin/envkit.js run -- node app.js
```

No `npm install` step — check `deps-proof.txt` for proof.

## Example

`.env`:
PORT=3000
API_KEY=abc123
NODE_ENV=dev

`.env.schema.json`:
```json
{
  "PORT": { "type": "number", "required": true },
  "API_KEY": { "type": "string", "required": true },
  "NODE_ENV": { "type": "enum", "values": ["dev", "prod"], "default": "dev" }
}
```

```bash
$ node bin/envkit.js check
✔ .env is valid
```

### Fallback values in expansion

HOST=${HOST:-localhost}
If `HOST` isn't set elsewhere, this resolves to `localhost`.

### Strict drift checking

```bash
envkit diff --strict
```
Same as `envkit diff`, but also fails (non-zero exit code) if `.env` contains keys not present in `.env.example` — useful in CI to enforce that `.env.example` stays the single source of truth.

### Checking for config drift

```bash
envkit diff
```
Compares your `.env` against `.env.example` and flags any keys that are missing or extra — useful for catching config drift when teammates add new required variables.

## Zero-Dependency Proof

See `deps-proof.txt` for `package.json`, `npm ls` output, and confirmation that `node_modules` contains nothing. See `STDLIB.md` for exactly which package we replaced with which Node.js stdlib module, and why.

## The Trust Comparison

Installing the equivalent tools the normal way:

```bash
npm install dotenv dotenv-expand zod
```

This pulls in **3 packages**, totaling **8.3MB** in `node_modules` (see `full-tree.txt` for the actual `npm ls --all` output).

envkit: **0 packages. 0MB. Fully readable in one sitting.**

## Testing

```bash
npm test
```
22 tests covering the parser, variable expansion, and schema validator — using Node's built-in `node:test` runner, not Jest/Mocha.

## Honest Limits

- Does not support multiline heredoc-style `.env` values (`KEY="""multi\nline"""`)
- `${VAR:-default}` fallback syntax inside expansion is not supported — use the schema's `default` field instead
- Schema validation is intentionally flat (no nested object schemas)
- Slower than a compiled/optimized library for very large `.env` files (not benchmarked at scale — this is a correctness-first implementation, not a performance one)

We're disclosing these rather than hiding them — a smaller, honest tool beats a polished one with hidden gaps.

## Track

**Track A — Developer Tools & CLI**

## License

MIT
