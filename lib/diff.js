export function diffEnv(actualKeys, exampleKeys) {
  const actualSet = new Set(actualKeys);
  const exampleSet = new Set(exampleKeys);

  const missing = exampleKeys.filter(k => !actualSet.has(k));
  const extra = actualKeys.filter(k => !exampleSet.has(k));

  return {
    inSync: missing.length === 0 && extra.length === 0,
    missing,
    extra
  };
}