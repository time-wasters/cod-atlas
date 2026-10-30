"use client";

import { useLayoutEffect, useRef } from "react";
import { Tooltip } from "../../shared/components/tooltip.js";

export function FittedLevelTitle({
  children,
  disabled,
  onActivate,
  onDoubleActivate,
}: {
  children: string;
  disabled: boolean;
  onActivate: () => void;
  onDoubleActivate: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = title.current;
    if (!element) return;
    let lastWidth = -1;
    const fit = () => {
      const width = Math.round(element.getBoundingClientRect().width);
      if (width === lastWidth) return;
      lastWidth = width;
      let size = 30;
      element.style.fontSize = `${size}px`;
      while (element.scrollHeight > element.clientHeight + 1 && size > 17) {
        size -= 1;
        element.style.fontSize = `${size}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);

  return (
    <h2 ref={title}>
      <Tooltip content="Show on map; double-click or Shift+Enter to focus">
        <button
          className="mission-title-button"
          type="button"
          disabled={disabled}
          aria-label={`Show ${children} on map`}
          onClick={(event) => {
            if (event.detail < 2) onActivate();
          }}
          onDoubleClick={onDoubleActivate}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              onDoubleActivate();
            }
          }}
        >
          {children}
        </button>
      </Tooltip>
    </h2>
  );
}
