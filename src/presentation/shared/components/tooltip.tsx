"use client";

import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactElement, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { tooltipPosition } from "../models/tooltip-position.js";
import { TOOLTIP_CONFIG } from "../../../shared/config/tooltip.config.js";

type TriggerProps = Pick<HTMLAttributes<HTMLElement>,
  "aria-describedby" | "onPointerEnter" | "onPointerLeave" | "onPointerDown" | "onFocus" | "onBlur">;

export function TooltipSurface({ anchor, children, className = "", id }: {
  anchor: HTMLElement;
  children: ReactNode;
  className?: string;
  id: string;
}) {
  const surface = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = surface.current;
    if (!element) return;
    const position = tooltipPosition(anchor.getBoundingClientRect(), element.getBoundingClientRect(), {
      width: window.innerWidth, height: window.innerHeight,
    });
    element.style.left = `${position.left}px`;
    element.style.top = `${position.top}px`;
    element.style.visibility = "visible";
  }, [anchor, children, className]);

  return createPortal(
    <div ref={surface} id={id} role="tooltip" className={`atlas-tooltip-surface atlas-tooltip ${className}`.trim()}
      style={{ visibility: "hidden" }}>
      {children}
    </div>,
    anchor.closest("dialog[open]") ?? document.body,
  );
}

export function useTooltip(content: ReactNode, { delay = TOOLTIP_CONFIG.hoverDelayMs, className = "" } = {}) {
  const id = `atlas-tooltip-${useId().replaceAll(":", "")}`;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovered = useRef(false);
  const keyboardFocused = useRef(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const enabled = content !== undefined && content !== null && content !== false;
  const cancelTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const hide = useCallback(() => { cancelTimer(); setAnchor(null); }, [cancelTimer]);
  const show = useCallback((element: HTMLElement, wait: number) => {
    cancelTimer();
    if (!enabled) return;
    if (wait === 0) setAnchor(element);
    else timer.current = setTimeout(() => {
      timer.current = null;
      if (element.isConnected) setAnchor(element);
    }, wait);
  }, [cancelTimer, enabled]);
  const pointerEnter = useCallback((element: HTMLElement) => {
    hovered.current = true;
    show(element, delay);
  }, [delay, show]);
  const pointerLeave = useCallback(() => {
    hovered.current = false;
    if (!keyboardFocused.current) hide();
  }, [hide]);
  const pointerDown = useCallback(() => {
    keyboardFocused.current = false;
    hide();
  }, [hide]);
  const focus = useCallback((element: HTMLElement) => {
    // Pointer clicks also focus buttons. Only keyboard focus should keep a
    // tooltip open after the pointer leaves; compound controls may focus an input.
    keyboardFocused.current = element.matches(":focus-visible") || element.querySelector(":focus-visible") !== null;
    if (keyboardFocused.current) show(element, 0);
  }, [show]);
  const blur = useCallback(() => {
    keyboardFocused.current = false;
    if (!hovered.current) hide();
  }, [hide]);
  useEffect(() => cancelTimer, [cancelTimer]);
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, [enabled, hide]);
  const triggerProps: TriggerProps = {
    "aria-describedby": anchor && enabled ? id : undefined,
    onPointerEnter: (event) => pointerEnter(event.currentTarget),
    onPointerLeave: pointerLeave,
    onPointerDown: pointerDown,
    onFocus: (event) => focus(event.currentTarget),
    onBlur: (event) => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      blur();
    },
  };
  return {
    anchor,
    triggerProps,
    pointerEnter, pointerLeave, pointerDown, focus, blur,
    tooltip: anchor && enabled ? <TooltipSurface anchor={anchor} id={id} className={className}>{content}</TooltipSurface> : null,
  };
}

// Use the same tooltip for DOM controls created by a map library.
export function ElementTooltip({ container, selector, ready, content }: {
  container: RefObject<HTMLElement | null>;
  selector: string;
  ready: boolean;
  content: string;
}) {
  const { anchor, triggerProps, tooltip, pointerEnter, pointerLeave, pointerDown, focus, blur } = useTooltip(content);
  useEffect(() => {
    if (!ready) return;
    const root = container.current;
    if (!root) return;
    const titles = new Map<HTMLElement, string>();
    const target = (event: PointerEvent | FocusEvent) => {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
      if (!element || !root.contains(element)) return null;
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return null;
      return element;
    };
    const prepare = (element: HTMLElement) => {
      const nativeTitle = element.getAttribute("title");
      if (nativeTitle !== null) {
        titles.set(element, nativeTitle);
        element.removeAttribute("title");
      }
    };
    const enter = (event: PointerEvent) => {
      const element = target(event);
      if (element) { prepare(element); pointerEnter(element); }
    };
    const leave = (event: PointerEvent) => { if (target(event)) pointerLeave(); };
    const press = (event: PointerEvent) => { if (target(event)) pointerDown(); };
    const focusElement = (event: FocusEvent) => {
      const element = target(event);
      if (element) { prepare(element); focus(element); }
    };
    const blurElement = (event: FocusEvent) => { if (target(event)) blur(); };
    // Delegation also covers attribution links recreated when the basemap changes.
    root.addEventListener("pointerover", enter, true);
    root.addEventListener("pointerout", leave, true);
    root.addEventListener("pointerdown", press, true);
    root.addEventListener("focusin", focusElement, true);
    root.addEventListener("focusout", blurElement, true);
    return () => {
      root.removeEventListener("pointerover", enter, true);
      root.removeEventListener("pointerout", leave, true);
      root.removeEventListener("pointerdown", press, true);
      root.removeEventListener("focusin", focusElement, true);
      root.removeEventListener("focusout", blurElement, true);
      for (const [element, title] of titles) element.setAttribute("title", title);
    };
  }, [container, selector, ready, pointerEnter, pointerLeave, pointerDown, focus, blur]);
  const describedBy = triggerProps["aria-describedby"];
  useEffect(() => {
    if (!ready || !anchor || !describedBy) return;
    const previous = anchor.getAttribute("aria-describedby");
    anchor.setAttribute("aria-describedby", [previous, describedBy].filter(Boolean).join(" "));
    return () => {
      if (previous === null) anchor.removeAttribute("aria-describedby");
      else anchor.setAttribute("aria-describedby", previous);
    };
  }, [anchor, ready, describedBy]);
  return ready ? tooltip : null;
}

// Cloning preserves the trigger's layout, ref, accessible name, and existing handlers.
// The render function form also lets compound controls describe their focused input.
// Usage: <Tooltip content="Pause tour"><button type="button">...</button></Tooltip>
export function Tooltip({ children, content, delay, className }: {
  children: ReactElement<HTMLAttributes<HTMLElement>> | ((props: TriggerProps) => ReactNode);
  content?: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { triggerProps, tooltip } = useTooltip(content, { delay, className });
  const trigger = typeof children === "function" ? children(triggerProps) : cloneElement(children, {
    "aria-describedby": [children.props["aria-describedby"], triggerProps["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    onPointerEnter: (event) => { children.props.onPointerEnter?.(event); triggerProps.onPointerEnter?.(event); },
    onPointerLeave: (event) => { children.props.onPointerLeave?.(event); triggerProps.onPointerLeave?.(event); },
    onPointerDown: (event) => { children.props.onPointerDown?.(event); triggerProps.onPointerDown?.(event); },
    onFocus: (event) => { children.props.onFocus?.(event); triggerProps.onFocus?.(event); },
    onBlur: (event) => { children.props.onBlur?.(event); triggerProps.onBlur?.(event); },
  });
  return <>{trigger}{tooltip}</>;
}
