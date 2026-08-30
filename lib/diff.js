/**
 * Compares two lists of environment variable keys and reports
 * which are missing or extra, plus a formatted summary.
 *
 * @param {string[]} actualKeys - Keys from the real .env file.
 * @param {string[]} exampleKeys - Keys from the .env.example template.
 * @returns {{inSync: boolean, missing: string[], extra: string[], summary: string}}
 */
export function diffEnv(actualKeys, exampleKeys) {
  const actualSet = new Set(actualKeys);
  const exampleSet = new Set(exampleKeys);

  const missing = exampleKeys.filter(k => !actualSet.has(k));
  const extra = actualKeys.filter(k => !exampleSet.has(k));
  const inSync = missing.length === 0 && extra.length === 0;

  const summary = inSync
    ? `In sync — ${actualKeys.length} keys match .env.example`
    : `${missing.length} missing, ${extra.length} extra (out of ${exampleKeys.length} expected keys)`;

  return { inSync, missing, extra, summary };
}