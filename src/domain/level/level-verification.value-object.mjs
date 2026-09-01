export const unverifiedHumanReview = Object.freeze({ byHuman: false, user: null });

function normalizeHumanReview(value, path) {
  if (value === undefined) return unverifiedHumanReview;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  if (typeof value.byHuman !== "boolean") {
    throw new Error(`${path}.byHuman must be a boolean`);
  }
  if (value.user !== null && (typeof value.user !== "string" || !value.user.trim())) {
    throw new Error(`${path}.user must be a non-empty string or null`);
  }
  if (value.byHuman && value.user === null) {
    throw new Error(`${path}.user is required when byHuman is true`);
  }
  if (!value.byHuman && value.user !== null) {
    throw new Error(`${path}.user must be null when byHuman is false`);
  }
  return { byHuman: value.byHuman, user: value.user };
}

export function normalizeLevelVerification(value, path) {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    throw new Error(`${path} must be an object`);
  }
  return {
    locations: normalizeHumanReview(value?.locations, `${path}.locations`),
    research: normalizeHumanReview(value?.research, `${path}.research`),
  };
}
