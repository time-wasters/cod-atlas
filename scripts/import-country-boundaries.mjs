import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SOURCE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson";
const OUTPUT_DIRECTORY = path.resolve("public/data/country-boundaries");
const LEGACY_OUTPUT_PATH = path.resolve("public/data/country-boundaries.geojson");
const SIMPLIFICATION_TOLERANCE = 0.001;

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let deltaX = end[0] - x;
  let deltaY = end[1] - y;

  if (deltaX !== 0 || deltaY !== 0) {
    const progress = ((point[0] - x) * deltaX + (point[1] - y) * deltaY)
      / (deltaX * deltaX + deltaY * deltaY);
    if (progress > 1) {
      x = end[0];
      y = end[1];
    } else if (progress > 0) {
      x += deltaX * progress;
      y += deltaY * progress;
    }
  }

  deltaX = point[0] - x;
  deltaY = point[1] - y;
  return deltaX * deltaX + deltaY * deltaY;
}

function simplifyOpenLine(points, squaredTolerance) {
  if (points.length <= 2) return points;
  let furthestSquaredDistance = squaredTolerance;
  let furthestIndex = -1;

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = squaredSegmentDistance(points[index], points[0], points.at(-1));
    if (distance > furthestSquaredDistance) {
      furthestSquaredDistance = distance;
      furthestIndex = index;
    }
  }

  if (furthestIndex === -1) return [points[0], points.at(-1)];
  return [
    ...simplifyOpenLine(points.slice(0, furthestIndex + 1), squaredTolerance).slice(0, -1),
    ...simplifyOpenLine(points.slice(furthestIndex), squaredTolerance),
  ];
}

function ringArc(points, startIndex, endIndex) {
  const arc = [points[startIndex]];
  let index = startIndex;
  while (index !== endIndex) {
    index = (index + 1) % points.length;
    arc.push(points[index]);
  }
  return arc;
}

function simplifyRing(ring) {
  const points = ring.slice(0, -1);
  if (points.length <= 4) return ring;

  const longitudes = points.map((point) => point[0]);
  if (Math.max(...longitudes) - Math.min(...longitudes) > 180) return ring;

  let firstIndex = 0;
  for (let index = 1; index < points.length; index += 1) {
    if (points[index][0] < points[firstIndex][0]) firstIndex = index;
  }

  let secondIndex = firstIndex;
  let furthestSquaredDistance = -1;
  for (let index = 0; index < points.length; index += 1) {
    const deltaX = points[index][0] - points[firstIndex][0];
    const deltaY = points[index][1] - points[firstIndex][1];
    const distance = deltaX * deltaX + deltaY * deltaY;
    if (distance > furthestSquaredDistance) {
      furthestSquaredDistance = distance;
      secondIndex = index;
    }
  }

  const squaredTolerance = SIMPLIFICATION_TOLERANCE * SIMPLIFICATION_TOLERANCE;
  const firstArc = simplifyOpenLine(ringArc(points, firstIndex, secondIndex), squaredTolerance);
  const secondArc = simplifyOpenLine(ringArc(points, secondIndex, firstIndex), squaredTolerance);
  const simplified = [...firstArc.slice(0, -1), ...secondArc.slice(0, -1), firstArc[0]];
  return simplified.length >= 4 ? simplified : ring;
}

function roundedPoint(point) {
  return point.map((coordinate) => Number(coordinate.toFixed(5)));
}

function simplifyPolygon(polygon) {
  return polygon.map((ring) => simplifyRing(ring).map(roundedPoint));
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { type: geometry.type, coordinates: simplifyPolygon(geometry.coordinates) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: geometry.type,
      coordinates: geometry.coordinates.map(simplifyPolygon),
    };
  }
  throw new Error(`Unsupported Natural Earth geometry: ${geometry.type}`);
}

async function readSource() {
  const sourcePath = argumentValue("--source");
  if (sourcePath) return readFile(path.resolve(sourcePath), "utf8");
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Natural Earth download failed: HTTP ${response.status}`);
  return response.text();
}

const source = JSON.parse(await readSource());
const featuresByCode = new Map();
for (const feature of source.features) {
  const isoA2 = feature.properties?.ISO_A2_EH;
  if (!/^[A-Z]{2}$/.test(isoA2)) continue;
  const simplified = simplifyGeometry(feature.geometry);
  const polygons = simplified.type === "Polygon"
    ? [simplified.coordinates]
    : simplified.coordinates;
  const existing = featuresByCode.get(isoA2);
  if (existing) {
    existing.polygons.push(...polygons);
    if (["Country", "Sovereign country"].includes(feature.properties.TYPE)) {
      existing.name = feature.properties.NAME_EN;
    }
    continue;
  }
  featuresByCode.set(isoA2, {
    name: feature.properties.NAME_EN,
    polygons,
  });
}

const features = [...featuresByCode.entries()].map(([isoA2, boundary]) => ({
  type: "Feature",
  properties: {
    isoA2,
    name: boundary.name,
  },
  geometry: boundary.polygons.length === 1
    ? { type: "Polygon", coordinates: boundary.polygons[0] }
    : { type: "MultiPolygon", coordinates: boundary.polygons },
}));

const outputDirectory = path.resolve(argumentValue("--output") ?? OUTPUT_DIRECTORY);
await mkdir(outputDirectory, { recursive: true });
const writtenFilenames = new Set();
await Promise.all(features.map(async (feature) => {
  const filename = `${feature.properties.isoA2.toLowerCase()}.geojson`;
  writtenFilenames.add(filename);
  await writeFile(path.join(outputDirectory, filename), `${JSON.stringify({
    ...feature,
    source: "Natural Earth Admin 0 Countries, 1:10m, version 5.1.1",
    sourceUrl: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/",
  })}\n`, "utf8");
}));

for (const filename of await readdir(outputDirectory)) {
  if (filename.endsWith(".geojson") && !writtenFilenames.has(filename)) {
    await unlink(path.join(outputDirectory, filename));
  }
}
if (outputDirectory === OUTPUT_DIRECTORY) {
  await unlink(LEGACY_OUTPUT_PATH).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
}
console.log(`Wrote ${features.length} country boundaries to ${path.relative(process.cwd(), outputDirectory)}.`);
