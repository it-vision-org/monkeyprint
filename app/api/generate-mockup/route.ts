import sharp from "sharp";
import path from "path";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const TEMPLATES_DIR = path.join(process.cwd(), "mockupproject", "templates");

// ─── Template catalog ────────────────────────────────────────────
// Maps category → array of template folder names.
// For now every slot points to male_1 (the only template we have).
// Add new folders under mockupproject/templates/ and update this map.
const TEMPLATE_CATALOG: Record<string, string[]> = {
  male: ["male_1", "male_1", "male_1", "male_1"],
  female: ["male_1", "male_1", "male_1", "male_1"],
  boy: ["male_1", "male_1", "male_1", "male_1"],
  girl: ["male_1", "male_1", "male_1", "male_1"],
};

// ─── Mask analysis ───────────────────────────────────────────────
async function analyzeMask(maskPath: string) {
  const { data, info } = await sharp(maskPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;

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

// ─── Core mockup compositing ────────────────────────────────────
async function generateMockup({
  templateId,
  shirtColor,
  designBuffer,
}: {
  templateId: string;
  shirtColor: string;
  designBuffer: Buffer;
}): Promise<Buffer> {
  const templateDir = path.join(TEMPLATES_DIR, templateId);
  const basePath = path.join(templateDir, "base.png");
  const maskPath = path.join(templateDir, "mask.png");

  if (!fs.existsSync(basePath) || !fs.existsSync(maskPath)) {
    throw new Error(`Template "${templateId}" not found`);
  }

  const baseMeta = await sharp(basePath).metadata();
  const width = baseMeta.width!;
  const height = baseMeta.height!;

  // Parse hex color
  const r = parseInt(shirtColor.slice(1, 3), 16);
  const g = parseInt(shirtColor.slice(3, 5), 16);
  const b = parseInt(shirtColor.slice(5, 7), 16);

  // --- Step 1: Color the shirt ---
  const colorLayer = await sharp({
    create: { width, height, channels: 4, background: { r, g, b, alpha: 255 } },
  })
    .png()
    .toBuffer();

  const maskedColor = await sharp(colorLayer)
    .composite([{ input: maskPath, blend: "dest-in" }])
    .png()
    .toBuffer();

  let resultBuffer = await sharp(basePath)
    .composite([{ input: maskedColor, blend: "multiply" }])
    .png()
    .toBuffer();

  // --- Step 2: Overlay design ---
  const shirtBounds = await analyzeMask(maskPath);

  const designWidth = Math.round(shirtBounds.width * 0.5);
  const designHeight = Math.round(shirtBounds.height * 0.45);
  const designX = shirtBounds.centerX - Math.round(designWidth / 2);
  const designY = shirtBounds.centerY - Math.round(designHeight / 2);

  const resizedDesign = await sharp(designBuffer)
    .resize(designWidth, designHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Place design on canvas, clip to shirt boundary
  const designOnCanvas = await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resizedDesign, top: designY, left: designX, blend: "over" }])
    .png()
    .toBuffer();

  const clippedDesign = await sharp(designOnCanvas)
    .composite([{ input: maskPath, blend: "dest-in" }])
    .png()
    .toBuffer();

  resultBuffer = await sharp(resultBuffer)
    .composite([{ input: clippedDesign, blend: "over" }])
    .png()
    .toBuffer();

  // --- Step 3: Apply fabric wrinkle texture ---
  const texturePath = path.join(templateDir, "texture.png");
  let textureBuffer: Buffer;

  if (fs.existsSync(texturePath)) {
    textureBuffer = await sharp(texturePath).png().toBuffer();
  } else {
    textureBuffer = await sharp(basePath).grayscale().normalize().png().toBuffer();
  }

  // Mask texture to only where the design has pixels
  const clippedDesignAlpha = await sharp(clippedDesign)
    .ensureAlpha()
    .extractChannel(3)
    .toBuffer();

  const maskedTexture = await sharp(textureBuffer)
    .ensureAlpha()
    .composite([{ input: clippedDesignAlpha, blend: "dest-in" }])
    .png()
    .toBuffer();

  resultBuffer = await sharp(resultBuffer)
    .composite([{ input: maskedTexture, blend: "soft-light" }])
    .png()
    .toBuffer();

  return resultBuffer;
}

// ─── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designImageBase64, templateId, shirtColor = "#FFFFFF" } = body;

    if (!designImageBase64) {
      return NextResponse.json(
        { error: "Design image is required" },
        { status: 400 },
      );
    }
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 },
      );
    }

    // Validate template exists in catalog
    const allTemplateIds = new Set(Object.values(TEMPLATE_CATALOG).flat());
    if (!allTemplateIds.has(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 },
      );
    }

    // Validate hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(shirtColor)) {
      return NextResponse.json(
        { error: "Invalid shirt color (use #RRGGBB)" },
        { status: 400 },
      );
    }

    console.log("\n=== Mockup Generation (Sharp compositing) ===");
    console.log("Template:", templateId, "| Color:", shirtColor);

    // Strip data URL prefix if present
    const base64Data = designImageBase64.replace(
      /^data:image\/[a-zA-Z+]+;base64,/,
      "",
    );
    const designBuffer = Buffer.from(base64Data, "base64");

    const resultBuffer = await generateMockup({
      templateId,
      shirtColor,
      designBuffer,
    });

    // Convert to base64 data URL
    const resultBase64 = `data:image/png;base64,${resultBuffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      image: resultBase64,
    });
  } catch (error: any) {
    console.error("Mockup generation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

// ─── GET: list available templates per category ──────────────────
export async function GET() {
  const catalog: Record<string, { id: string; index: number; name: string }[]> = {};

  for (const [category, templateIds] of Object.entries(TEMPLATE_CATALOG)) {
    catalog[category] = templateIds.map((id, index) => {
      const configPath = path.join(TEMPLATES_DIR, id, "config.json");
      let name = id;
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        name = config.name || id;
      } catch {}
      return { id, index, name: `${name} ${index + 1}` };
    });
  }

  return NextResponse.json({ catalog });
}
