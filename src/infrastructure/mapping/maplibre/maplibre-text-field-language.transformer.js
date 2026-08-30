const mapNameProperties = new Set([
  "name",
  "name:latin",
  "name_en",
  "name:en",
]);
const mapNameTokenPattern = /^\{(?:name|name:latin|name_en|name:en)\}$/;

function createEnglishNameExpression() {
  return [
    "coalesce",
    ["get", "name:en"],
    ["get", "name_en"],
    ["get", "name:latin"],
    ["get", "name"],
  ];
}

export function preferEnglishMapLibreTextField(textField) {
  let changed = false;

  function transform(value) {
    if (Array.isArray(value)) {
      if (value[0] === "get" && mapNameProperties.has(value[1])) {
        changed = true;
        return createEnglishNameExpression();
      }
      return value.map(transform);
    }

    if (typeof value === "string" && mapNameTokenPattern.test(value)) {
      changed = true;
      return createEnglishNameExpression();
    }

    return value;
  }

  const value = transform(textField);
  return { changed, value };
}
