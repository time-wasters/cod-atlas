function cloneLocations(locations) {
  return locations.map((location) => structuredClone(location));
}

export function resolveLevelLocationInheritance(levels, {
  labelFor = (level) => level.id,
} = {}) {
  const levelsById = new Map();
  for (const level of levels) {
    if (levelsById.has(level.id)) {
      throw new Error(`${labelFor(level)}: duplicate level id ${level.id}`);
    }
    levelsById.set(level.id, level);
  }

  for (const level of levels) {
    if (level.metadata != null
      && (typeof level.metadata !== "object" || Array.isArray(level.metadata))) {
      throw new Error(`${labelFor(level)}: metadata must be an object`);
    }
    const variantOf = level.metadata?.variantOf;
    if (variantOf == null) continue;
    if (typeof variantOf !== "string" || !variantOf.trim()) {
      throw new Error(`${labelFor(level)}: metadata.variantOf must be a non-empty canonical level ID`);
    }
    if (!levelsById.has(variantOf)) {
      throw new Error(`${labelFor(level)}: unknown metadata.variantOf level ${variantOf}`);
    }
  }

  const checkedVariants = new Set();
  const checkingVariants = new Set();
  const variantStack = [];

  function validateVariantChain(level) {
    if (checkedVariants.has(level.id)) return;
    if (checkingVariants.has(level.id)) {
      const cycleStart = variantStack.indexOf(level.id);
      const cycle = [...variantStack.slice(cycleStart), level.id].join(" -> ");
      throw new Error(`${labelFor(level)}: circular metadata.variantOf relationship: ${cycle}`);
    }

    checkingVariants.add(level.id);
    variantStack.push(level.id);
    const variantOf = level.metadata?.variantOf;
    if (variantOf != null) validateVariantChain(levelsById.get(variantOf));
    variantStack.pop();
    checkingVariants.delete(level.id);
    checkedVariants.add(level.id);
  }

  for (const level of levels) validateVariantChain(level);

  const resolved = new Set();
  const resolving = new Set();
  const stack = [];

  function resolve(level) {
    if (resolved.has(level.id)) return level.locations;
    if (resolving.has(level.id)) {
      const cycleStart = stack.indexOf(level.id);
      const cycle = [...stack.slice(cycleStart), level.id].join(" -> ");
      throw new Error(`${labelFor(level)}: circular metadata.variantOf location inheritance: ${cycle}`);
    }

    if (Object.hasOwn(level, "locations")) {
      if (!Array.isArray(level.locations)) {
        throw new Error(`${labelFor(level)}: locations must be an array`);
      }
      resolved.add(level.id);
      return level.locations;
    }

    const variantOf = level.metadata?.variantOf;
    if (typeof variantOf !== "string" || !variantOf.trim()) {
      throw new Error(
        `${labelFor(level)}: locations is required unless metadata.variantOf links to a canonical level`,
      );
    }
    const source = levelsById.get(variantOf);

    resolving.add(level.id);
    stack.push(level.id);
    try {
      level.locations = cloneLocations(resolve(source));
      resolved.add(level.id);
      return level.locations;
    } finally {
      stack.pop();
      resolving.delete(level.id);
    }
  }

  for (const level of levels) resolve(level);
  return levels;
}
