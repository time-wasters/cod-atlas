const iconPaths = {
  googleMaps: "webpage_icons/maps-google-com.ico",
  wikipedia: "webpage_icons/wikipedia-com.ico",
  callOfDutyMaps: "webpage_icons/callofdutymaps-com.webp",
  fandom: "webpage_icons/callofduty-fandom-com.webp",
} as const;

export function ExternalLinkIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    // These tiny reviewed favicon assets do not need runtime image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={iconPaths[name]} width="24" height="24" alt="" aria-hidden="true" />
  );
}
