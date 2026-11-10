"use client";

import type { RefObject } from "react";
import type { CookieConsent, CookieConsentChoices } from "../../../application/settings/ports/cookie-consent.port.js";

type CookieConsentDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  consent: CookieConsent;
  onChange: (choices: CookieConsentChoices) => void;
  onClose: () => void;
};

export function CookieConsentDialog({ dialogRef, consent, onChange, onClose }: CookieConsentDialogProps) {
  const applyAndClose = (choices: CookieConsentChoices) => {
    onChange(choices);
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="settings-surface cookie-consent-dialog"
      aria-labelledby="cookie-consent-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <header>
        <h2 id="cookie-consent-title">Cookie consent</h2>
        <button type="button" aria-label="Close cookie consent" onClick={() => dialogRef.current?.close()}>×</button>
      </header>
      <div className="settings-content">
        <div className="cookie-consent-content">
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
            <button type="button" onClick={() => applyAndClose({ preferences: false, externalServices: false })}>Reject all</button>
            <button type="button" onClick={() => applyAndClose({ preferences: true, externalServices: true })}>Accept all</button>
            <button type="button" onClick={() => dialogRef.current?.close()}>Done</button>
          </div>
          <p>Allowing an option saves your consent choice. You can turn either option off here at any time. Turning off saved preferences removes the settings saved by this app.</p>
        </div>
      </div>
    </dialog>
  );
}

