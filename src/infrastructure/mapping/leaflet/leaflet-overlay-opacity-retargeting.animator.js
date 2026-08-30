import { createBrowserAnimationFrameClock } from "../../browser/animation/browser-animation-frame.clock.js";

export function retargetLeafletOverlayOpacity({
  animationRef,
  clock = createBrowserAnimationFrameClock(),
  opacityRef,
  overlay,
  target,
  targetRef,
}) {
  targetRef.current = target;
  if (clock.prefersReducedMotion()) {
    if (animationRef.current !== null) clock.cancelFrame(animationRef.current);
    overlay.setOpacity(target);
    opacityRef.current = target;
    animationRef.current = null;
    return;
  }
  if (animationRef.current !== null) return;

  let previousTime = clock.now();
  const tick = (now) => {
    const elapsed = Math.min(64, now - previousTime);
    previousTime = now;
    const blend = 1 - Math.exp(-elapsed / 115);
    const nextOpacity = opacityRef.current
      + (targetRef.current - opacityRef.current) * blend;
    const settled = Math.abs(targetRef.current - nextOpacity) < 0.001;
    const opacity = settled ? targetRef.current : nextOpacity;
    overlay.setOpacity(opacity);
    opacityRef.current = opacity;
    if (settled) animationRef.current = null;
    else animationRef.current = clock.requestFrame(tick);
  };
  animationRef.current = clock.requestFrame(tick);
}

