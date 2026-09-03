function positivelyMatchesFerry(filter) {
  if (!Array.isArray(filter)) return false;
  const [operator, property, ...values] = filter;
  if ((operator === "==" || operator === "in") && property === "class") {
    return values.includes("ferry");
  }
  if (operator !== "all" && operator !== "any") return false;
  return filter.slice(1).some(positivelyMatchesFerry);
}

export function hideMapLibreFerryLines(map) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "line") continue;
    const namedAsFerry = layer.id.toLowerCase().includes("ferry");
    if (!namedAsFerry && !positivelyMatchesFerry(layer.filter)) continue;
    map.setLayoutProperty(layer.id, "visibility", "none");
  }
}
