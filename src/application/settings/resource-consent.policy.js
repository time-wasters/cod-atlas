/**
 * Fail closed for external URLs, including protocol-relative URLs.
 * @param {string} source
 * @param {boolean} externalServicesAllowed
 * @param {string} baseUrl
 */
export function canLoadResource(source, externalServicesAllowed, baseUrl) {
  if (!source.trim()) return false;
  try {
    const url = new URL(source, baseUrl);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
    return externalServicesAllowed || url.origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}
