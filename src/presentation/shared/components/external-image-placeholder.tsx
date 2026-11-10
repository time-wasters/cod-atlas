"use client";

export function ExternalImagePlaceholder({ label, onOpenCookieConsent }: {
  label: string;
  onOpenCookieConsent: () => void;
}) {
  return (
    <span className="external-image-placeholder" role="group" aria-label={`${label}: external image blocked`}>
      <strong>{label}</strong>
      <span>This image is hosted externally. Its provider receives your IP address and may set cookies.</span>
      <button type="button" aria-haspopup="dialog" onClick={onOpenCookieConsent}>Cookie consent</button>
      <small>Choose whether to allow external images before loading them.</small>
    </span>
  );
}
