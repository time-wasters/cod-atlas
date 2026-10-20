import { createBrowserAnimationFrameClock } from "../../browser/animation/browser-animation-frame.clock.js";
import { MAP_OVERLAY_CONFIG } from "../../../shared/config/map-overlay.config.js";

export function retargetLeafletOverlayOpacity({
  animationRef,
  clock = createBrowserAnimationFrameClock(),
  fadeInMs = MAP_OVERLAY_CONFIG.default.fadeInMs,
  fadeOutMs = MAP_OVERLAY_CONFIG.default.fadeOutMs,
  onComplete,
  opacityRef,
  overlay,
  target,
  targetRef,
}) {
  targetRef.current = target;
  if (clock.prefersReducedMotion() || (target >= opacityRef.current ? fadeInMs : fadeOutMs) <= 0) {
    if (animationRef.current !== null) clock.cancelFrame(animationRef.current);
    overlay.setOpacity(target);
    opacityRef.current = target;
    animationRef.current = null;
    onComplete?.();
    return;
  }
  if (animationRef.current !== null) return;
  if (opacityRef.current === target) { onComplete?.(); return; }

  let start = opacityRef.current;
  let startedAt = clock.now();
  let previousTime = startedAt;
  let destination = target;
  const tick = (now) => {
    if (destination !== targetRef.current) {
      start = opacityRef.current;
      startedAt = previousTime;
      destination = targetRef.current;
    }
    previousTime = now;
    const duration = destination >= start ? fadeInMs : fadeOutMs;
    const progress = duration <= 0 ? 1 : Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 3;
    const opacity = progress === 1 ? destination : start + (destination - start) * eased;
    overlay.setOpacity(opacity);
    opacityRef.current = opacity;
    if (progress === 1) {
      animationRef.current = null;
      onComplete?.();
    } else animationRef.current = clock.requestFrame(tick);
  };
  animationRef.current = clock.requestFrame(tick);
}

