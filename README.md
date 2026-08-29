# envkit

A zero-dependency replacement for `dotenv` + `dotenv-expand` + schema validation (`zod`/`envalid`) — built entirely on Node.js's standard library. No `npm install` required, ever.

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

## Zero-Dependency Proof

See `deps-proof.txt` for `package.json`, `npm ls` output, and confirmation that `node_modules` contains nothing. See `STDLIB.md` for exactly which package we replaced with which Node.js stdlib module, and why.

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