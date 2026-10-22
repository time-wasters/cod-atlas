import { Tooltip } from "../../shared/components/tooltip.js";

export function AtlasHeader({
  locationCount,
  onOpenSettings,
}: {
  locationCount: number;
  onOpenSettings: () => void;
}) {
  return (
    <header className="atlas-header">
      <div className="atlas-brand">
        <h1>
          {/* This reviewed local brand asset does not need runtime image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="images/banner.png" width="790" height="153" alt="CoD Atlas" />
        </h1>
        <p>Real-world geography of the series</p>
      </div>
      <div className="header-stat">
        <strong>{locationCount}</strong>
        <span>locations</span>
      </div>
      <Tooltip content="Open settings">
        <button className="settings-button" type="button" aria-label="Open settings" onClick={onOpenSettings}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10 2h4l.5 2.5 1.5.7 2.2-1.4 2 2L18.8 8l.7 1.5 2.5.5v4l-2.5.5-.7 1.5 1.4 2.2-2 2-2.2-1.4-1.5.7L14 22h-4l-.5-2.5-1.5-.7-2.2 1.4-2-2L5.2 16l-.7-1.5L2 14v-4l2.5-.5L5.2 8 3.8 5.8l2-2L8 5.2l1.5-.7L10 2Z" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
        </button>
      </Tooltip>
    </header>
  );
}
