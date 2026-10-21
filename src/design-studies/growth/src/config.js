/** Versioned, user-editable authoring parameters (safe and reproducible). */
export const DEFAULT_CONFIG = Object.freeze({
  version: 2,
  preset: 'kapok-study-01',
  seeds: {
    trunk: 431988, buttress: 3107, surfaceRoots: 9104, underground: 8026,
    terrain: 7171, groundLife: 5252, stones: 3008, branches: 431988,
    leaves: 8832, moss: 9904, vines: 6403, epiphytes: 5012, atmosphere: 7291
  },
  trunk: { buttressCount: 6 },
  canopy: { primaryMin: 4, primaryMax: 6, secondaryMin: 4, secondaryMax: 6 },
  ground: { stoneCount: 135, moundCount: 43 }
});
const clone = (value) => JSON.parse(JSON.stringify(value));
function clampInteger(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
}
export function normalizeConfig(source = {}) {
  const conf = clone(DEFAULT_CONFIG);
  if (!source || typeof source !== 'object' || Array.isArray(source)) return conf;
  if (typeof source.preset === 'string') conf.preset = source.preset.slice(0, 80);
  for (const key of Object.keys(conf.seeds)) {
    conf.seeds[key] = clampInteger(source.seeds?.[key], conf.seeds[key], 0, 4294967295);
  }
  conf.trunk.buttressCount = clampInteger(source.trunk?.buttressCount, 6, 3, 12);
  for (const key of Object.keys(conf.canopy)) {
    conf.canopy[key] = clampInteger(source.canopy?.[key], conf.canopy[key], 1, 12);
  }
  conf.canopy.primaryMax = Math.max(conf.canopy.primaryMin, conf.canopy.primaryMax);
  conf.canopy.secondaryMax = Math.max(conf.canopy.secondaryMin, conf.canopy.secondaryMax);
  conf.ground.stoneCount = clampInteger(source.ground?.stoneCount, 135, 0, 500);
  conf.ground.moundCount = clampInteger(source.ground?.moundCount, 43, 0, 250);
  return conf;
}
export function readConfig() {
  const saved = new URLSearchParams(location.search).get('growth');
  if (!saved) return normalizeConfig();
  try { return normalizeConfig(JSON.parse(decodeURIComponent(saved))); }
  catch { return normalizeConfig(); }
}
