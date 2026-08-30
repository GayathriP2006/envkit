/**
 * Validates a set of environment values against a schema definition.
 * Collects all errors rather than stopping at the first failure.
 *
 * @param {Object<string, string>} values - Environment values to validate.
 * @param {Object<string, {type: string, required?: boolean, default?: any, values?: string[]}>} schema
 *   Schema definition. Supported types: "string", "number", "boolean", "enum", "url".
 * @returns {{valid: boolean, errors: string[], values: Object}} Validation result,
 *   including the final values object with defaults applied.
 */
export function validateSchema(values, schema) {
  const errors = [];
  const output = { ...values };

  for (const [key, rule] of Object.entries(schema)) {
    let val = output[key];

    if ((val === undefined || val === '') && rule.default !== undefined) {
      val = rule.default;
      output[key] = String(val);
    }

    if ((val === undefined || val === '') && rule.required) {
      errors.push(`${key}: required but missing`);
      continue;
    }

    if (val === undefined) continue;

    switch (rule.type) {
      case 'number':
        if (isNaN(Number(val))) errors.push(`${key}: expected number, got "${val}"`);
        break;
      case 'boolean':
        if (!['true', 'false'].includes(String(val))) {
          errors.push(`${key}: expected true/false, got "${val}"`);
        }
        break;
      case 'enum':
        if (!rule.values.includes(val)) {
          errors.push(`${key}: expected one of [${rule.values.join(', ')}], got "${val}"`);
        }
        break;
      case 'url':
        try { new URL(val); } catch { errors.push(`${key}: invalid URL "${val}"`); }
        break;
      // 'string' needs no extra check
    }
  }

  return { valid: errors.length === 0, errors, values: output };
}