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

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
      value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    } else {
      const hashIndex = value.indexOf(' #');
      if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
    }

    result[key] = value;
  });

  return result;
}