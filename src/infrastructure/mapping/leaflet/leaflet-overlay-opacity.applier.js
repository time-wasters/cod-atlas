import { createBrowserAnimationFrameClock } from "../../browser/animation/browser-animation-frame.clock.js";

export function applyLeafletOverlayOpacity({
  animationRef,
  clock = createBrowserAnimationFrameClock(),
  opacityRef,
  overlay,
  target,
  targetRef,
}) {
  if (animationRef.current !== null) clock.cancelFrame(animationRef.current);
  animationRef.current = null;
  targetRef.current = target;
  opacityRef.current = target;
  overlay.setOpacity(target);
}

