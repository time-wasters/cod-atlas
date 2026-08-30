import { preferEnglishMapLibreTextField } from "./maplibre-text-field-language.transformer.js";

export function applyEnglishMapLibreLabels(map) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    const textField = map.getLayoutProperty(layer.id, "text-field");
    if (textField == null) continue;
    const englishTextField = preferEnglishMapLibreTextField(textField);
    if (englishTextField.changed) {
      map.setLayoutProperty(layer.id, "text-field", englishTextField.value);
    }
  }
}
