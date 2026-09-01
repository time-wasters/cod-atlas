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
      <button className="settings-button" type="button" aria-label="Open settings" onClick={onOpenSettings}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.1 5.1v-3.2l-2.3-.7a7 7 0 0 0-.7-1.6l1.1-2.2-2.2-2.2-2.2 1.1a7 7 0 0 0-1.6-.7L11.5 2H8.4l-.7 2.3a7 7 0 0 0-1.6.7L3.9 3.9 1.7 6.1l1.1 2.2a7 7 0 0 0-.7 1.6L0 10.5v3.1l2.3.7a7 7 0 0 0 .7 1.6l-1.1 2.2 2.2 2.2 2.2-1.1a7 7 0 0 0 1.6.7l.7 2.3h3.1l.7-2.3a7 7 0 0 0 1.6-.7l2.2 1.1 2.2-2.2-1.1-2.2a7 7 0 0 0 .7-1.6l2.2-.7Z" />
        </svg>
      </button>
    </header>
  );
}
