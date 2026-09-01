export async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch (error) {
    throw new Error("The image commands require the Sharp dependency. Run `npm ci` or rebuild the tooling container.", {
      cause: error,
    });
  }
}
