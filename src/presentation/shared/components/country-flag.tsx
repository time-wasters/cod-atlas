export function CountryFlag({ code }: { code: string | null }) {
  return (
    <span
      className={code ? `flag:${code} country-select-flag` : "country-select-flag is-placeholder"}
      aria-hidden="true"
    />
  );
}
