"use client";

import type { CookieConsent, CookieConsentChoices } from "../../../application/settings/ports/cookie-consent.port.js";

type ConsentActions = {
  consent: CookieConsent;
  onChange: (choices: CookieConsentChoices) => void;
};

export function CookieConsentControls({ consent, onChange }: ConsentActions) {
  return (
    <section className="settings-cookie-notice" aria-labelledby="settings-cookies-title">
      <h3 id="settings-cookies-title">Cookie consent</h3>
      <p>Saved preferences and external images stay off until you allow them. CoD Atlas has no advertising or visitor analytics.</p>
      <label className="consent-choice">
        <input type="checkbox" checked={consent.preferences}
          onChange={(event) => onChange({ preferences: event.target.checked, externalServices: consent.externalServices })} />
        <span><strong>Save display preferences</strong>Remember your settings in this browser across visits. Without this permission, settings apply only to the current visit.</span>
      </label>
      <label className="consent-choice">
        <input type="checkbox" checked={consent.externalServices}
          onChange={(event) => onChange({ preferences: consent.preferences, externalServices: event.target.checked })} />
        <span><strong>Allow external images</strong>Load external Wiki images and images in briefing notes. Media providers receive your IP address and may set cookies, including Cloudflare security cookies.</span>
      </label>
      <p>The map works without cookie consent. Map providers still receive your IP address when serving map data.</p>
      <div className="consent-actions">
        <button type="button" onClick={() => onChange({ preferences: false, externalServices: false })}>Reject all</button>
        <button type="button" onClick={() => onChange({ preferences: true, externalServices: true })}>Accept all</button>
      </div>
      <p>Allowing an option saves your consent choice. You can turn either option off here at any time. Turning off saved preferences removes the settings saved by this app.</p>
    </section>
  );
}

export function CookieConsentBanner({ onChange, onCustomize }: {
  onChange: ConsentActions["onChange"];
  onCustomize: () => void;
}) {
  return (
    <section className="cookie-consent-banner" aria-labelledby="cookie-consent-title">
      <h2 id="cookie-consent-title">Your cookie choices</h2>
      <p>Saved preferences and external images are off. Media providers receive connection data and may set cookies. Choose what to allow; the map stays available either way.</p>
      <div className="consent-actions">
        <button type="button" onClick={() => onChange({ preferences: false, externalServices: false })}>Reject all</button>
        <button type="button" onClick={onCustomize}>Choose in Settings</button>
        <button type="button" onClick={() => onChange({ preferences: true, externalServices: true })}>Accept all</button>
      </div>
    </section>
  );
}
