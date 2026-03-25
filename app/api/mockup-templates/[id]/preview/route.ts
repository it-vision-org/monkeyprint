import sharp from "sharp";
import path from "path";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const TEMPLATES_DIR = path.join(process.cwd(), "mockupproject", "templates");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Sanitize template id to prevent path traversal
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const basePath = path.join(TEMPLATES_DIR, safeId, "base.png");

  if (!fs.existsSync(basePath)) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Generate a smaller preview (400px wide) for fast loading
  const previewBuffer = await sharp(basePath)
    .resize(400, null, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  return new NextResponse(new Uint8Array(previewBuffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
