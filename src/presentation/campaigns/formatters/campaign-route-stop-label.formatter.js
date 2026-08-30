export function formatCampaignRouteStopOrder(order) {
  return String(order).padStart(2, "0");
}

export function formatCampaignRouteStopLabel(orders) {
  const uniqueOrders = [...new Set(orders)].sort((left, right) => left - right);
  const first = uniqueOrders[0];
  const last = uniqueOrders.at(-1);
  const consecutive = uniqueOrders.every((order, index) => (
    index === 0 || order === uniqueOrders[index - 1] + 1
  ));
  if (uniqueOrders.length > 1 && consecutive) {
    return `${formatCampaignRouteStopOrder(first)}–${formatCampaignRouteStopOrder(last)}`;
  }
  return uniqueOrders.map(formatCampaignRouteStopOrder).join(",");
}
