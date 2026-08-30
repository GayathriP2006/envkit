/**
 * Parses .env file contents into a flat key-value object.
 * Supports comments (#), blank lines, single/double quoted values,
 * escaped characters inside double quotes, and multiline double-quoted values.
 *
 * @param {string} fileContents - Raw text content of a .env file.
 * @returns {Object<string, string>} Parsed key-value pairs, all values as strings.
 * @throws {Error} If a non-empty, non-comment line has no '=' separator,
 *   or a multiline quoted value is never closed.
 */

export function parseEnv(fileContents) {
  const result = {};
  const lines = fileContents.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      i++;
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      throw new Error(`Parse error on line ${i + 1}: no '=' found`);
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let valuePart = trimmed.slice(eqIndex + 1).trim();

    // Detect start of a multiline double-quoted value:
    // starts with " but does not end with a closing " on the same line
    if (valuePart.startsWith('"') && !isClosedOnSameLine(valuePart)) {
      const collected = [valuePart.slice(1)]; // drop opening quote
      i++;
      let closed = false;

      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.trimEnd().endsWith('"') && !nextLine.trimEnd().endsWith('\\"')) {
          collected.push(nextLine.slice(0, nextLine.lastIndexOf('"')));
          closed = true;
          i++;
          break;
        }
        collected.push(nextLine);
        i++;
      }

      if (!closed) {
        throw new Error(`Parse error: unterminated multiline value for key "${key}"`);
      }

      let value = collected.join('\n');
      value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"');
      result[key] = value;
      continue;
    }

    // Single-line value (existing logic)
    let value = valuePart;

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
      value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
      // single quotes: keep contents literal, no escape expansion
    } else {
      const hashIndex = value.indexOf(' #');
      if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
    }

    result[key] = value;
    i++;
  }

  return result;
}
/**
 * Checks whether a double-quoted value that starts on this line
 * also has its closing quote on the same line (i.e. not multiline).
 * @param {string} valuePart - The value portion of the line, starting with a quote.
 * @returns {boolean} True if the value is closed on the same line.
 */
function isClosedOnSameLine(valuePart) {
  // valuePart starts with ", check if there's a matching unescaped " later in the same string
  if (valuePart.length < 2) return false;
  const rest = valuePart.slice(1);
  // find an unescaped closing quote
  let j = 0;
  while (j < rest.length) {
    if (rest[j] === '"' && rest[j - 1] !== '\\') return true;
    j++;
  }
  return false;
}