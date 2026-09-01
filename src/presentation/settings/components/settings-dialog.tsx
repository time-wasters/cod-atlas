"use client";

type SettingSwitch = {
  enabled: boolean;
  onToggle: () => void;
};

export function SettingsDialog({
  externalIcons,
  externalIconsUnavailable,
  onClose,
  overlayFading,
}: {
  externalIcons: SettingSwitch;
  externalIconsUnavailable: boolean;
  onClose: () => void;
  overlayFading: SettingSwitch;
}) {
  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <div className="settings-surface">
        <header>
          <h2 id="settings-title">Settings</h2>
          <button type="button" aria-label="Close settings" onClick={onClose}>×</button>
        </header>
        <div className="settings-content">
          <section className="settings-group">
            <div className="settings-copy">
              <h3>External game icons</h3>
              <p>Use imported icons when available; local icons remain the fallback.</p>
              {externalIcons.enabled && externalIconsUnavailable && <small className="is-warning">External icons are unavailable in this build; local icons are still active.</small>}
            </div>
            <button
              className={`settings-switch${externalIcons.enabled ? " is-enabled" : ""}`}
              type="button"
              role="switch"
              aria-checked={externalIcons.enabled}
              onClick={externalIcons.onToggle}
            >
              <span aria-hidden="true" />
              <b>{externalIcons.enabled ? "On" : "Off"}</b>
            </button>
          </section>
          <section className="settings-group">
            <div className="settings-copy">
              <h3>Zoom-based overlay fading</h3>
              <p>Fade overlays beyond their overview scale and hide them at street-detail zoom.</p>
            </div>
            <button
              className={`settings-switch${overlayFading.enabled ? " is-enabled" : ""}`}
              type="button"
              role="switch"
              aria-label="Zoom-based overlay fading"
              aria-checked={overlayFading.enabled}
              onClick={overlayFading.onToggle}
            >
              <span aria-hidden="true" />
              <b>{overlayFading.enabled ? "On" : "Off"}</b>
            </button>
          </section>
          <p className="settings-note">This preference is stored only in this browser.</p>
        </div>
      </div>
    </section>
  );
}
