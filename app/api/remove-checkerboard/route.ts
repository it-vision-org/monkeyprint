import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

/**
 * Smart checkerboard background removal.
 *
 * AI image generators often produce JPGs with a baked-in checkerboard pattern
 * instead of real transparency. This algorithm:
 *  1. Detects the two checkerboard colors and grid cell size from image edges.
 *  2. Builds a per-pixel "is this part of the checkerboard?" confidence map.
 *  3. Flood-fills from the image edges through high-confidence background pixels
 *     so interior pixels that happen to match a checkerboard color are kept.
 *  4. Generates a smooth alpha channel with anti-aliased edges.
 */

interface Color {
  r: number;
  g: number;
  b: number;
}

function colorDistance(a: Color, b: Color): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function getPixel(
  data: Buffer,
  x: number,
  y: number,
  width: number,
  channels: number
): Color {
  const idx = (y * width + x) * channels;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
}

/**
 * Detect the two checkerboard colors by sampling the four corners of the image.
 */
function detectCheckerboardColors(
  data: Buffer,
  width: number,
  height: number,
  channels: number
): { c1: Color; c2: Color } | null {
  // Sample small patches at the four corners
  const patchSize = Math.min(16, Math.floor(width / 8), Math.floor(height / 8));
  const patches: Color[][] = [];

  const corners = [
    [0, 0],
    [width - patchSize, 0],
    [0, height - patchSize],
    [width - patchSize, height - patchSize],
  ];

  for (const [cx, cy] of corners) {
    const patch: Color[] = [];
    for (let dy = 0; dy < patchSize; dy++) {
      for (let dx = 0; dx < patchSize; dx++) {
        patch.push(getPixel(data, cx + dx, cy + dy, width, channels));
      }
    }
    patches.push(patch);
  }

  // Collect unique-ish colors (cluster into two groups)
  const allCornerPixels = patches.flat();

  // K-means-ish: pick two representative colors
  // Start with the first pixel and the one most different from it
  let c1 = allCornerPixels[0];
  let maxDist = 0;
  let c2 = allCornerPixels[0];

  for (const p of allCornerPixels) {
    const d = colorDistance(p, c1);
    if (d > maxDist) {
      maxDist = d;
      c2 = p;
    }
  }

  // If the two colors are too similar, this probably isn't a checkerboard
  if (maxDist < 20) return null;

  // Refine by averaging each cluster
  const cluster1: Color[] = [];
  const cluster2: Color[] = [];
  for (const p of allCornerPixels) {
    if (colorDistance(p, c1) < colorDistance(p, c2)) {
      cluster1.push(p);
    } else {
      cluster2.push(p);
    }
  }

  const avg = (arr: Color[]): Color => ({
    r: Math.round(arr.reduce((s, c) => s + c.r, 0) / arr.length),
    g: Math.round(arr.reduce((s, c) => s + c.g, 0) / arr.length),
    b: Math.round(arr.reduce((s, c) => s + c.b, 0) / arr.length),
  });

  if (cluster1.length === 0 || cluster2.length === 0) return null;

  return { c1: avg(cluster1), c2: avg(cluster2) };
}

/**
 * Detect the grid cell size by scanning the top edge for color transitions.
 */
function detectGridSize(
  data: Buffer,
  width: number,
  channels: number,
  c1: Color,
  c2: Color
): number {
  // Walk along the top row and count pixels until the closest checkerboard color flips
  let currentColor = closerTo(getPixel(data, 0, 0, width, channels), c1, c2);
  let runLength = 0;
  const runLengths: number[] = [];

  for (let x = 0; x < Math.min(width, 256); x++) {
    const p = getPixel(data, x, 0, width, channels);
    const closer = closerTo(p, c1, c2);
    if (closer === currentColor) {
      runLength++;
    } else {
      if (runLength > 0) runLengths.push(runLength);
      currentColor = closer;
      runLength = 1;
    }
  }
  if (runLength > 0) runLengths.push(runLength);

  if (runLengths.length < 2) return 16; // fallback

  // The grid size is the median run length
  runLengths.sort((a, b) => a - b);
  const median = runLengths[Math.floor(runLengths.length / 2)];
  return Math.max(4, Math.min(64, median));
}

function closerTo(p: Color, c1: Color, c2: Color): 1 | 2 {
  return colorDistance(p, c1) <= colorDistance(p, c2) ? 1 : 2;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const toleranceParam = formData.get("tolerance");
    const tolerance = toleranceParam ? Number(toleranceParam) : 45;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Decode image
    const image = sharp(buffer).removeAlpha().ensureAlpha();
    const { data: rawData, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // Step 1: Detect checkerboard colors
    const colors = detectCheckerboardColors(rawData, width, height, channels);
    if (!colors) {
      return NextResponse.json(
        { error: "Could not detect checkerboard pattern" },
        { status: 422 }
      );
    }

    const { c1, c2 } = colors;

    // Step 2: Detect grid size
    const gridSize = detectGridSize(rawData, width, channels, c1, c2);

    // Step 3: Build background confidence map
    // For each pixel: how likely is it part of the checkerboard?
    const totalPixels = width * height;
    const bgConfidence = new Float32Array(totalPixels);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p = getPixel(rawData, x, y, width, channels);

        // Which checkerboard cell is this pixel in?
        const cellX = Math.floor(x / gridSize);
        const cellY = Math.floor(y / gridSize);
        const expectedColor = (cellX + cellY) % 2 === 0 ? c1 : c2;
        const altColor = (cellX + cellY) % 2 === 0 ? c2 : c1;

        // Distance to expected and alternate checkerboard colors
        const distExpected = colorDistance(p, expectedColor);
        const distAlt = colorDistance(p, altColor);
        const minDist = Math.min(distExpected, distAlt);

        if (minDist < tolerance) {
          // Confidence: 1.0 at distance 0, 0.0 at distance = tolerance
          bgConfidence[idx] = 1.0 - minDist / tolerance;
        } else {
          bgConfidence[idx] = 0;
        }
      }
    }

    // Step 4: Flood fill from edges through high-confidence background pixels
    const isBackground = new Uint8Array(totalPixels); // 0=unknown, 1=bg, 2=fg
    const queue: number[] = [];
    const BG_CONFIDENCE_THRESHOLD = 0.3;

    // Seed from all edge pixels that have high bg confidence
    for (let x = 0; x < width; x++) {
      const topIdx = x;
      const bottomIdx = (height - 1) * width + x;
      if (bgConfidence[topIdx] >= BG_CONFIDENCE_THRESHOLD) {
        isBackground[topIdx] = 1;
        queue.push(topIdx);
      }
      if (bgConfidence[bottomIdx] >= BG_CONFIDENCE_THRESHOLD) {
        isBackground[bottomIdx] = 1;
        queue.push(bottomIdx);
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = y * width;
      const rightIdx = y * width + (width - 1);
      if (bgConfidence[leftIdx] >= BG_CONFIDENCE_THRESHOLD) {
        isBackground[leftIdx] = 1;
        queue.push(leftIdx);
      }
      if (bgConfidence[rightIdx] >= BG_CONFIDENCE_THRESHOLD) {
        isBackground[rightIdx] = 1;
        queue.push(rightIdx);
      }
    }

    // BFS flood fill
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);

      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d];
        const ny = y + dy[d];
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (isBackground[nIdx] !== 0) continue;

        if (bgConfidence[nIdx] >= BG_CONFIDENCE_THRESHOLD) {
          isBackground[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }

    // Step 5: Generate output with alpha channel
    // Create output buffer (RGBA)
    const output = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        const dstIdx = (y * width + x) * 4;
        const bgIdx = y * width + x;

        output[dstIdx] = rawData[srcIdx]; // R
        output[dstIdx + 1] = rawData[srcIdx + 1]; // G
        output[dstIdx + 2] = rawData[srcIdx + 2]; // B

        if (isBackground[bgIdx] === 1) {
          // Fully transparent
          output[dstIdx + 3] = 0;
        } else {
          // Foreground: fully opaque
          output[dstIdx + 3] = 255;
        }
      }
    }

    // Step 6: Edge smoothing — for pixels adjacent to the bg/fg boundary,
    // use a softer alpha based on how "checkerboard-like" the local area is.
    const SMOOTH_RADIUS = 2;
    const smoothed = Buffer.from(output);

    for (let y = SMOOTH_RADIUS; y < height - SMOOTH_RADIUS; y++) {
      for (let x = SMOOTH_RADIUS; x < width - SMOOTH_RADIUS; x++) {
        const idx = y * width + x;
        const dstIdx = idx * 4;

        // Only smooth pixels near the boundary
        if (isBackground[idx] === 1) continue;

        // Check if any neighbor is background
        let hasBgNeighbor = false;
        for (let dy2 = -SMOOTH_RADIUS; dy2 <= SMOOTH_RADIUS && !hasBgNeighbor; dy2++) {
          for (let dx2 = -SMOOTH_RADIUS; dx2 <= SMOOTH_RADIUS && !hasBgNeighbor; dx2++) {
            const nIdx = (y + dy2) * width + (x + dx2);
            if (isBackground[nIdx] === 1) hasBgNeighbor = true;
          }
        }

        if (!hasBgNeighbor) continue;

        // This is a boundary pixel. Calculate alpha based on checkerboard confidence.
        // High confidence = more transparent (closer to bg)
        const conf = bgConfidence[idx];
        if (conf > 0) {
          const alpha = Math.round(255 * (1 - conf * 0.8));
          smoothed[dstIdx + 3] = Math.min(smoothed[dstIdx + 3], alpha);
        }
      }
    }

    // Convert to PNG
    const pngBuffer = await sharp(smoothed, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer();

    // Copy into a plain ArrayBuffer so the body satisfies DOM BodyInit / BlobPart (Node Buffer uses ArrayBufferLike).
    const ab = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer;
    return new NextResponse(new Blob([ab], { type: "image/png" }), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="removed-bg.png"',
      },
    });
  } catch (err) {
    console.error("Checkerboard removal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
