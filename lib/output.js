const CODES = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' };

export function color(text, colorName) {
  return `${CODES[colorName] || ''}${text}${CODES.reset}`;
}