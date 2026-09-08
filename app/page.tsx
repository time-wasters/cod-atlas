import { AtlasPageClient } from "@/src/infrastructure/framework/next/atlas-page.client";

// Atlas data is generated at build time; no request-specific server state is used.
export const dynamic = "force-static";

/**
 * Application entry point.
 *
 * @returns AtlasPageClient
 */
export default function Page() {
  return <AtlasPageClient />;
}
