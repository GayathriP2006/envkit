/**
 * Resolves ${VAR} and ${VAR:-default} references within parsed .env values,
 * supporting nested/chained references and detecting circular dependencies.
 *
 * @param {Object<string, string>} parsed - Output of parseEnv().
 * @returns {Object<string, string>} Same shape, with all references resolved.
 * @throws {Error} If a circular reference is detected.
 */
export function expandVars(parsed) {
  const result = { ...parsed };
  const VAR_PATTERN = /\$\{([A-Z0-9_]+)(:-([^}]*))?\}/g;

  function resolve(key, seen = new Set()) {
    if (seen.has(key)) {
      throw new Error(`Circular reference detected involving: ${key}`);
    }
    seen.add(key);

    let value = result[key];
    if (value === undefined) return '';

    value = value.replace(VAR_PATTERN, (_, refKey, hasDefault, defaultVal) => {
      const refValue = result[refKey];
      if (refValue === undefined) {
        return hasDefault ? defaultVal : '';
      }
      return resolve(refKey, new Set(seen));
    });

    result[key] = value;
    return value;
  }

  for (const key of Object.keys(result)) {
    resolve(key);
  }

  return result;
}