export function expandVars(parsed) {
  const result = { ...parsed };
  const VAR_PATTERN = /\$\{([A-Z0-9_]+)\}/g;

  function resolve(key, seen = new Set()) {
    if (seen.has(key)) {
      throw new Error(`Circular reference detected involving: ${key}`);
    }
    seen.add(key);

    let value = result[key];
    if (value === undefined) return '';

    value = value.replace(VAR_PATTERN, (_, refKey) => resolve(refKey, seen));
    result[key] = value;
    return value;
  }

  for (const key of Object.keys(result)) {
    resolve(key);
  }

  return result;
}
