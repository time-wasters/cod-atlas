export function escapeMarkdownTableCell(value) {
  return value.replaceAll("|", "\\|");
}
