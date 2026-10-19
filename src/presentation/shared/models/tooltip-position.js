/**
 * Place a tooltip beside its trigger when possible, keeping it inside the viewport.
 * @param {{ left: number, right: number, top: number, bottom: number }} anchor
 * @param {{ width: number, height: number }} size
 * @param {{ width: number, height: number }} viewport
 */
export function tooltipPosition(anchor, size, viewport) {
  const margin = 8;
  const gap = 9;
  const clamp = (value, extent, limit) => Math.max(margin, Math.min(value, limit - extent - margin));
  let left;
  let top = (anchor.top + anchor.bottom - size.height) / 2;
  if (anchor.right + gap + size.width <= viewport.width - margin) {
    left = anchor.right + gap;
  } else if (anchor.left - gap - size.width >= margin) {
    left = anchor.left - gap - size.width;
  } else {
    left = (anchor.left + anchor.right - size.width) / 2;
    top = anchor.top - gap - size.height >= margin
      ? anchor.top - gap - size.height
      : anchor.bottom + gap;
  }
  return { left: clamp(left, size.width, viewport.width), top: clamp(top, size.height, viewport.height) };
}
