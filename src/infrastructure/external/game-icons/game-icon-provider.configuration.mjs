import process from "node:process";

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function configuredTemplate(value, name, requiredPlaceholders) {
  const template = value?.trim();
  if (!template) return null;
  let example;
  try {
    example = new URL(template
      .replaceAll("%app%", "1")
      .replaceAll("%icon%", "a")
      .replaceAll("%game%", "1")
      .replaceAll("%file%", "a.png"));
  } catch {
    throw new Error(`${name} must be a valid URL template`);
  }
  requireValue(example.protocol === "https:", `${name} must use HTTPS`);
  for (const placeholder of requiredPlaceholders) {
    requireValue(template.includes(placeholder), `${name} must include ${placeholder}`);
  }
  return template;
}

export function resolveGameIconProviderConfiguration(environment = process.env) {
  return {
    steamTemplate: configuredTemplate(
      environment.STEAM_ICON_URL,
      "STEAM_ICON_URL",
      ["%app%", "%icon%", "%extension%"],
    ),
    steamGridDbTemplate: configuredTemplate(
      environment.STEAMGRIDDB_ICON_URL,
      "STEAMGRIDDB_ICON_URL",
      ["%file%"],
    ),
  };
}
