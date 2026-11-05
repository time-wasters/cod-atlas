export type CookieConsentChoices = Readonly<{
  preferences: boolean;
  externalServices: boolean;
}>;

export type CookieConsent = CookieConsentChoices & { readonly decided: boolean };

export type CookieConsentPort = {
  getSnapshot: () => CookieConsent;
  getServerSnapshot: () => CookieConsent;
  subscribe: (listener: () => void) => () => void;
  update: (choices: CookieConsentChoices) => void;
};
