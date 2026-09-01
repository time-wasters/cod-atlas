export function CountryFlag({ code }: { code: string | null }) {
  if (!code) return null;

  return <span className={`flag:${code} country-select-flag`} aria-hidden="true" />;
}
