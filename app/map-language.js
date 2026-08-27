const NAME_PROPERTIES = new Set(["name", "name:latin", "name_en", "name:en"]);

function englishNameExpression() {
  return [
    "coalesce",
    ["get", "name:en"],
    ["get", "name_en"],
    ["get", "name:latin"],
    ["get", "name"],
  ];
}

export function preferEnglishTextField(textField) {
  let changed = false;

  function transform(value) {
    if (Array.isArray(value)) {
      if (value[0] === "get" && NAME_PROPERTIES.has(value[1])) {
        changed = true;
        return englishNameExpression();
      }
      return value.map(transform);
    }

    if (typeof value === "string" && /^\{(?:name|name:latin|name_en|name:en)\}$/.test(value)) {
      changed = true;
      return englishNameExpression();
    }

    return value;
  }

  const value = transform(textField);
  return { changed, value };
}

export function applyEnglishMapLabels(map) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    const textField = map.getLayoutProperty(layer.id, "text-field");
    if (textField == null) continue;
    const englishTextField = preferEnglishTextField(textField);
    if (englishTextField.changed) {
      map.setLayoutProperty(layer.id, "text-field", englishTextField.value);
    }
  }
}
