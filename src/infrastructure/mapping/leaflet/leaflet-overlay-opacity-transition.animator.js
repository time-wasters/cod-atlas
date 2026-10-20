import { createBrowserAnimationFrameClock } from "../../browser/animation/browser-animation-frame.clock.js";

export function animateLeafletOverlayOpacity({
  animationRef,
  clock = createBrowserAnimationFrameClock(),
  durationMs = 320,
  onComplete,
  opacityRef,
  overlay,
  target,
}) {
  if (animationRef.current !== null) clock.cancelFrame(animationRef.current);
  if (clock.prefersReducedMotion() || durationMs <= 0) {
    overlay.setOpacity(target);
    opacityRef.current = target;
    animationRef.current = null;
    onComplete?.();
    return;
  }

  const start = opacityRef.current;
  const startedAt = clock.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = 1 - (1 - progress) ** 3;
    const opacity = progress === 1 ? target : start + (target - start) * eased;
    overlay.setOpacity(opacity);
    opacityRef.current = opacity;
    if (progress < 1) animationRef.current = clock.requestFrame(tick);
    else {
      animationRef.current = null;
      onComplete?.();
    }
  };
  animationRef.current = clock.requestFrame(tick);
}

