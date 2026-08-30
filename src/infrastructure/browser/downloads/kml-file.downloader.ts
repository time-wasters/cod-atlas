const KML_MEDIA_TYPE = "application/vnd.google-earth.kml+xml";

export function downloadKmlFile(kml: string, filename = "call-of-duty-atlas.kml") {
  const objectUrl = URL.createObjectURL(new Blob([kml], { type: KML_MEDIA_TYPE }));

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
