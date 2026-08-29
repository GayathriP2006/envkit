export function validateSchema(values, schema) {
  const errors = [];
  const output = { ...values };

  for (const [key, rule] of Object.entries(schema)) {
    let val = output[key];

    if (val === undefined && rule.default !== undefined) {
      val = rule.default;
      output[key] = val;
    }

    if (val === undefined && rule.required) {
      errors.push(`${key}: required but missing`);
      continue;
    }

    // TODO: type checks for number, boolean, enum, url
  }

  return { valid: errors.length === 0, errors, values: output };
}
