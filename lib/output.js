const CODES = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' };
/**
 * Wraps text in ANSI color codes for terminal output.
 * @param {string} text - The text to color.
 * @param {'red'|'green'|'yellow'|'cyan'|'reset'} colorName - Which color to apply.
 * @returns {string} The text wrapped in ANSI escape codes.
 */
export function color(text, colorName) {
  return `${CODES[colorName] || ''}${text}${CODES.reset}`;
}