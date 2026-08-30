export function calculatePercentage(value, total) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}
