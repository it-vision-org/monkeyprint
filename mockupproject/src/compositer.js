const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Analyzes a mask image to find the bounding box and center of the
 * non-transparent (shirt) area. Returns { top, left, width, height, centerX, centerY }
 */
async function analyzeMask(maskPath) {
  const { data, info } = await sharp(maskPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + (channels - 1)];
      if (alpha > 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const bboxWidth = maxX - minX;
  const bboxHeight = maxY - minY;

  return {
    top: minY,
    left: minX,
    width: bboxWidth,
    height: bboxHeight,
    centerX: minX + Math.round(bboxWidth / 2),
    centerY: minY + Math.round(bboxHeight / 2),
  };
}

/**
 * Generates a t-shirt mockup:
 * 1. Analyze mask to find shirt center (auto-position if x/y not provided)
 * 2. Color the shirt via mask + multiply blend
 * 3. Place design, clipped to the shirt boundary
 * 4. Apply wrinkle texture via soft-light blend for realistic fabric look
 */
async function generateMockup({
  template,
  shirtColor,
  designBuffer,
  designX,
  designY,
  designWidth,
  designHeight,
}) {
  const templateDir = path.join(TEMPLATES_DIR, template);
  const basePath = path.join(templateDir, 'base.png');
  const maskPath = path.join(templateDir, 'mask.png');

  const baseMeta = await sharp(basePath).metadata();
  const { width, height } = baseMeta;

  // Parse hex color
  const r = parseInt(shirtColor.slice(1, 3), 16);
  const g = parseInt(shirtColor.slice(3, 5), 16);
  const b = parseInt(shirtColor.slice(5, 7), 16);

  // --- Step 1: Color the shirt ---
  const colorLayer = await sharp({
    create: { width, height, channels: 4, background: { r, g, b, alpha: 255 } },
  }).png().toBuffer();

  const maskedColor = await sharp(colorLayer)
    .composite([{ input: maskPath, blend: 'dest-in' }])
    .png()
    .toBuffer();

  let resultBuffer = await sharp(basePath)
    .composite([{ input: maskedColor, blend: 'multiply' }])
    .png()
    .toBuffer();

  // --- Step 2: Overlay design if provided ---
  if (designBuffer) {
    // Analyze the mask to find the shirt's bounding box and center
    const shirtBounds = await analyzeMask(maskPath);

    // Auto-calculate design size if not provided:
    // Default to ~50% of the shirt width, maintaining aspect ratio
    if (!designWidth && !designHeight) {
      designWidth = Math.round(shirtBounds.width * 0.5);
      designHeight = Math.round(shirtBounds.height * 0.45);
    } else if (!designWidth) {
      designWidth = designHeight;
    } else if (!designHeight) {
      designHeight = designWidth;
    }

    // Auto-center on the shirt if position not provided
    // Place it centered horizontally, and slightly above vertical center (chest area)
    if (designX == null || designY == null) {
      designX = shirtBounds.centerX - Math.round(designWidth / 2);
      designY = shirtBounds.centerY - Math.round(designHeight / 2);
    }

    const resizedDesign = await sharp(designBuffer)
      .resize(designWidth, designHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Place design on full-size canvas, then clip to shirt boundary
    const designOnCanvas = await sharp({
      create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: resizedDesign, top: designY, left: designX, blend: 'over' }])
      .png()
      .toBuffer();

    const clippedDesign = await sharp(designOnCanvas)
      .composite([{ input: maskPath, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // Composite clipped design onto the colored shirt
    resultBuffer = await sharp(resultBuffer)
      .composite([{ input: clippedDesign, blend: 'over' }])
      .png()
      .toBuffer();

    // --- Step 3: Apply fabric wrinkle texture ---
    // This is what makes the design look actually PRINTED on the shirt
    // instead of just pasted on top. The wrinkles/folds/shadows from
    // the original fabric show through the design.
    //
    // How it works:
    //   1. Get a grayscale texture of the shirt surface (wrinkles = dark, flat = mid-gray)
    //   2. Mask it to only the design area
    //   3. Composite with 'soft-light' blend — this bends the design's colors
    //      according to the fabric's light/shadow, making creases visible

    const texturePath = path.join(templateDir, 'texture.png');
    let textureBuffer;

    if (fs.existsSync(texturePath)) {
      // Use custom hand-tuned texture if provided
      textureBuffer = await sharp(texturePath).png().toBuffer();
    } else {
      // Auto-generate from base image: grayscale + normalize pulls out
      // the wrinkle detail and maps it to a full 0-255 range
      textureBuffer = await sharp(basePath)
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
    }

    // Mask texture to only where the design has pixels
    const clippedDesignAlpha = await sharp(clippedDesign)
      .ensureAlpha()
      .extractChannel(3)
      .toBuffer();

    const maskedTexture = await sharp(textureBuffer)
      .ensureAlpha()
      .composite([{ input: clippedDesignAlpha, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // soft-light blend: mid-gray = no change, dark = darken (shadow/crease),
    // light = lighten (highlight). This imprints the fabric's 3D surface
    // onto the design naturally.
    resultBuffer = await sharp(resultBuffer)
      .composite([{ input: maskedTexture, blend: 'soft-light' }])
      .png()
      .toBuffer();
  }

  return resultBuffer;
}

/**
 * Lists all available templates with their metadata.
 * Also computes auto-centered design defaults from the mask.
 */
async function listTemplates() {
  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });

  const templates = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const configPath = path.join(TEMPLATES_DIR, entry.name, 'config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        // Compute auto-center from mask
        const maskPath = path.join(TEMPLATES_DIR, entry.name, 'mask.png');
        if (fs.existsSync(maskPath)) {
          try {
            const bounds = await analyzeMask(maskPath);
            const autoWidth = Math.round(bounds.width * 0.5);
            const autoHeight = Math.round(bounds.height * 0.45);
            config.autoDesign = {
              x: bounds.centerX - Math.round(autoWidth / 2),
              y: bounds.centerY - Math.round(autoHeight / 2),
              width: autoWidth,
              height: autoHeight,
            };
            config.shirtBounds = bounds;
          } catch (e) {
            // mask analysis failed, skip
          }
        }

        templates.push({ id: entry.name, ...config });
      }
    }
  }

  return templates;
}

module.exports = { generateMockup, listTemplates, analyzeMask };
