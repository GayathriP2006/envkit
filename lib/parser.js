export function parseEnv(fileContents) {
  const result = {};
  const lines = fileContents.split(/\r?\n/);

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      throw new Error(`Parse error on line ${i + 1}: no '=' found`);
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // TODO: strip surrounding quotes, handle escaped \n inside quotes
    result[key] = value;
  });

  return result;
}
