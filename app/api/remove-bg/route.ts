import { NextRequest, NextResponse } from "next/server";

const REMBG_URL = process.env.REMBG_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Forward to FastAPI rembg service
    const serviceForm = new FormData();
    serviceForm.append("file", new Blob([buffer], { type: "image/png" }), "image.png");

    const response = await fetch(`${REMBG_URL}/remove-bg`, {
      method: "POST",
      body: serviceForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`rembg service error: ${errorText}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="removed-bg.png"',
      },
    });
  } catch (err) {
    console.error("rembg error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
