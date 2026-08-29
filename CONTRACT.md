# envkit — Module Contract

All 4 modules must follow these exact shapes. Do not change without team agreement.

## parser.js
`parseEnv(fileContents: string) -> object`
Input: raw text of a .env file
Output: plain object, all values as strings
Example: `{ PORT: "3000", API_KEY: "abc123" }`
Throws: Error with message `"Parse error on line N: <reason>"`

## expand.js
`expandVars(parsed: object) -> object`
Input: output of parseEnv()
Output: same shape, with ${VAR} references resolved
Throws: Error `"Circular reference detected: A -> B -> A"`

## validate.js
`validateSchema(values: object, schema: object) -> result`
schema shape:
{ KEY: { type: "string"|"number"|"boolean"|"enum"|"url", required: bool, default: any, values: [] } }
result shape:
{ valid: bool, errors: string[], values: object }
Never throws — always returns a result object.

## output.js
`color(text: string, colorName: string) -> string`
colorName: "red" | "green" | "yellow" | "cyan" | "reset"

## CLI commands (bin/envkit.js)
- `envkit check` — parse + expand + validate current .env, print result, exit 1 on failure
- `envkit run -- <command>` — validate first, then spawn the command if valid
- `envkit init` — scaffold a starter .env.schema.json file
