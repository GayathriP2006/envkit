
# STDLIB.md — What We Replaced and How

Every package we would normally `npm install` for this project, replaced with Node.js's built-in standard library.

## dotenv → lib/parser.js
**Normally:** `npm install dotenv`
**Instead:** Hand-written line-by-line parser using string methods (`split`, `indexOf`, `slice`, `trim`) — no regex-heavy magic, just careful string handling.
Handles: comments, blank lines, quoted values (single/double), escaped `\n` inside quotes, inline comments after unquoted values.
**Known limits:** Does not support multiline heredoc-style values (`KEY="""...multiple lines..."""`) that some `.env` files use. See README → Honest Limits.

## dotenv-expand → lib/expand.js
**Normally:** `npm install dotenv-expand`
**Instead:** Recursive string interpolation using `String.replace()` with a regex to find `${VAR}` patterns, resolving each reference against already-parsed values.
Handles: nested/chained variable references, circular reference detection (throws a clear error instead of infinite looping).
**Known limits:** Does not support default-value syntax some tools allow, like `${VAR:-default}`.

## zod / envalid / joi → lib/validate.js
**Normally:** `npm install zod` (or envalid, or joi)
**Instead:** A small hand-rolled schema engine using `typeof`, `Number.isNaN`, the built-in `URL` constructor for URL validation, and array `.includes()` for enum checks.
Handles: required fields, default values, type checking (string/number/boolean/enum/url), and — unlike some libraries — collects *all* validation errors at once instead of stopping at the first one.
**Known limits:** No support for nested object schemas or custom validator functions; this is intentionally scoped to flat key-value `.env` validation only.

## commander / yargs → bin/envkit.js
**Normally:** `npm install commander` or `yargs`
**Instead:** Manual parsing of `process.argv`, since envkit only needs 3 subcommands (`check`, `run`, `init`) — a full argument-parsing library would be overkill for this surface area.

## chalk → lib/output.js
**Normally:** `npm install chalk`
**Instead:** Raw ANSI escape codes (`\x1b[31m` for red, etc.) — this is literally what chalk does internally, without the abstraction layer.

## jest / mocha → test/*.test.js
**Normally:** `npm install --save-dev jest` (or mocha + chai)
**Instead:** Node's built-in `node:test` and `node:assert` modules (stable since Node 20, used here on Node 24). 22 tests covering parser, expand, and validate modules, run via `node --test`.

## child_process spawning for `envkit run`
This uses Node's built-in `child_process.spawn` — technically part of the stdlib already, called out here for completeness since it's the mechanism behind the `run` subcommand.