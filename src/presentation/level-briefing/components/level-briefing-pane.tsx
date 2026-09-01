"use client";

import ReactMarkdown from "react-markdown";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";

type BriefingState = {
  status: "loading" | "missing" | "ready";
  content: string | null;
} | null;

function imageBasename(source: string) {
  return source.split(/[?#]/, 1)[0].split("/").at(-1) ?? source;
}

export function LevelBriefingPane({
  activeOverlayId,
  briefing,
  historyOverlays,
  onClose,
  onToggleHistoryOverlay,
  title,
}: {
  activeOverlayId: string | null;
  briefing: BriefingState;
  historyOverlays: HistoryOverlayDto[];
  onClose: () => void;
  onToggleHistoryOverlay: (overlay: HistoryOverlayDto) => void;
  title: string;
}) {
  return (
    <aside id="selected-level-briefing" className="level-briefing-pane" aria-labelledby="level-briefing-title">
      <header>
        <div>
          <span>Level briefing</span>
          <h2 id="level-briefing-title">{title}</h2>
        </div>
        <button type="button" aria-label="Close level briefing" onClick={onClose}>×</button>
      </header>
      <div className="level-briefing-content">
        {briefing?.status === "loading" && <p className="level-briefing-state">Loading briefing…</p>}
        {briefing?.status === "missing" && <p className="level-briefing-state">No briefing has been written for this level yet.</p>}
        {briefing?.status === "ready" && briefing.content && (
          <ReactMarkdown
            components={{
              a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
              img: ({ src = "", alt = "" }) => {
                const imageSource = typeof src === "string" ? src : "";
                const historyOverlay = historyOverlays.find(
                  (overlay) => imageBasename(overlay.image) === imageBasename(imageSource),
                );
                if (!historyOverlay) {
                  // Markdown images are authored content and cannot use the Next image optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  return <img src={imageSource} alt={alt} />;
                }
                const isActive = activeOverlayId === historyOverlay.id;
                const action = isActive ? "Hide from map" : "Show on map";
                const imageUrl = new URL(historyOverlay.image.replace(/^\/+/, ""), document.baseURI).href;
                return (
                  <button
                    className={`history-overlay-image${isActive ? " is-active" : ""}`}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${action}: ${historyOverlay.attribution.title}`}
                    title={`${action}: ${historyOverlay.attribution.title}`}
                    onClick={() => onToggleHistoryOverlay(historyOverlay)}
                  >
                    {/* Repository-hosted research figures do not use the Next image optimizer. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={alt || historyOverlay.attribution.title} />
                    <span>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
                      {action}
                    </span>
                  </button>
                );
              },
            }}
          >
            {briefing.content}
          </ReactMarkdown>
        )}
      </div>
    </aside>
  );
}
