export function parseWikiMarkupText(value) {
  if (!value) return null;
  const text = value.replace(/<!--[^]*?-->/g, " ").replace(/<br\s*\/?\s*>/gi, ", ")
    .replace(/<ref\b[^>]*>[^]*?<\/ref>|<ref\b[^>]*\/>/gi, " ")
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1").replace(/{{[^{}]*}}/g, " ")
    .replace(/'{2,}/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}
