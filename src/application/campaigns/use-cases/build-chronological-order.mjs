/**
 * Resolves a complete chronological sequence from imported previous/next links.
 * Explicit chronological neighbors replace conflicting in-game neighbors.
 * Missing, branching, or cyclic sequences do not establish an order.
 */
export function buildChronologicalOrder({ levels, wikiArticles }) {
  const levelsByArticle = new Map(levels.map((level) => [level.wikiArticle, level.id]));
  if (levels.length < 2 || levelsByArticle.size !== levels.length) return null;

  const chronologicalEdges = [];
  const gameEdges = [];
  for (const level of levels) {
    const article = wikiArticles.get(level.wikiArticle);
    if (!article) return null;
    for (const field of ["previousLevels", "nextLevels"]) {
      for (const link of article[field]?.links ?? []) {
        if (link.sequence === "chronological" && !link.article) return null;
        const neighborId = levelsByArticle.get(link.article);
        if (!neighborId) continue;
        const edge = field === "previousLevels"
          ? [neighborId, level.id] : [level.id, neighborId];
        if (link.sequence === "chronological") chronologicalEdges.push(edge);
        else if (link.sequence === "game") gameEdges.push(edge);
      }
    }
  }
  if (!chronologicalEdges.length) return null;

  const previous = new Map();
  const next = new Map();
  const addEdge = ([from, to]) => {
    if (from === to || (next.has(from) && next.get(from) !== to)
      || (previous.has(to) && previous.get(to) !== from)) return false;
    next.set(from, to);
    previous.set(to, from);
    return true;
  };
  for (const edge of chronologicalEdges) {
    if (!addEdge(edge)) return null;
  }
  const resolveOrders = () => {
    const starts = levels.filter((level) => !previous.has(level.id));
    if (starts.length !== 1) return null;
    const orders = new Map();
    let levelId = starts[0].id;
    while (levelId && !orders.has(levelId)) {
      orders.set(levelId, orders.size + 1);
      levelId = next.get(levelId);
    }
    return orders.size === levels.length && !levelId ? orders : null;
  };
  const explicitOrder = resolveOrders();
  if (explicitOrder) return explicitOrder;

  const chronologicalNext = new Set(next.keys());
  const chronologicalPrevious = new Set(previous.keys());
  for (const edge of gameEdges) {
    if (chronologicalNext.has(edge[0]) || chronologicalPrevious.has(edge[1])) continue;
    if (!addEdge(edge)) return null;
  }

  return resolveOrders();
}
