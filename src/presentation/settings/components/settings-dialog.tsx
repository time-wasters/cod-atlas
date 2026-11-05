"use client";

import type { CookieConsent, CookieConsentChoices } from "../../../application/settings/ports/cookie-consent.port.js";
import { CookieConsentControls } from "./cookie-consent.js";

type SettingSwitch = {
  enabled: boolean;
  onToggle: () => void;
};

function SettingsSwitch({ label, setting }: { label: string; setting: SettingSwitch }) {
  return (
    <button
      className={`settings-switch${setting.enabled ? " is-enabled" : ""}`}
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={setting.enabled}
      onClick={setting.onToggle}
    >
      <span aria-hidden="true" />
    </button>
  );
}

export function SettingsDialog({
  consent,
  externalIcons,
  externalIconsUnavailable,
  myrmecophobiaMode,
  onClose,
  onConsentChange,
  overlayFading,
}: {
  consent: CookieConsent;
  externalIcons: SettingSwitch;
  externalIconsUnavailable: boolean;
  myrmecophobiaMode: SettingSwitch;
  onClose: () => void;
  onConsentChange: (choices: CookieConsentChoices) => void;
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
          <CookieConsentControls consent={consent} onChange={onConsentChange} />
          <section className="settings-group">
            <div className="settings-copy">
              <h3>External game icons</h3>
              <p>Use imported icons when available; local icons remain the fallback.</p>
              {externalIcons.enabled && externalIconsUnavailable && <small className="is-warning">External icons are unavailable in this build; local icons are still active.</small>}
            </div>
            <SettingsSwitch label="External game icons" setting={externalIcons} />
          </section>
          <section className="settings-group">
            <div className="settings-copy">
              <h3>Zoom-based overlay fading</h3>
              <p>Fade overlays beyond their overview scale and hide them at street-detail zoom.</p>
            </div>
            <SettingsSwitch label="Zoom-based overlay fading" setting={overlayFading} />
          </section>
          <section className="settings-group">
            <div className="settings-copy">
              <h3>Myrmecophobia mode</h3>
              <p>Stops the ants running from one place to another along campaign routes.</p>
            </div>
            <SettingsSwitch label="Myrmecophobia mode" setting={myrmecophobiaMode} />
          </section>
        </div>
      </div>
    </section>
  );
}
