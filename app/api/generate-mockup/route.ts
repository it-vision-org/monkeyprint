import { NextRequest, NextResponse } from "next/server";
import { uploadImageToR2, getR2Url } from "@/lib/storage";

const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;
if (!KIE_AI_API_KEY) {
  throw new Error("KIE_AI_API_KEY environment variable is not set");
}

const KIE_API_BASE = "https://api.kie.ai";

// ─── Scene descriptors per audience ──────────────────────────────
const SCENES: Record<string, string> = {
  homme:
    "a confident stylish man in his late 20s, " +
    "wearing the t-shirt, casual urban outfit, " +
    "standing in a bright modern city street, golden hour natural light",

  femme:
    "a stylish woman in her late 20s, " +
    "wearing the t-shirt, relaxed chic outfit, " +
    "standing in a bright airy space, soft diffused natural light",

  enfant:
    "a happy energetic child aged 8–10, " +
    "wearing the t-shirt, playful pose, " +
    "colorful park background, bright cheerful daylight",

  famille:
    "a happy modern family of four — parents and two children, " +
    "all wearing matching t-shirts, " +
    "outdoors in a sunny park, warm golden light, candid joyful moment",

  sport:
    "a fit athletic person in their 20s, " +
    "wearing the t-shirt, dynamic action pose, " +
    "gym or outdoor track background, dramatic sports photography lighting",

  corporate:
    "a professional confident person in their 30s, " +
    "wearing the t-shirt over smart-casual trousers, " +
    "clean modern office or co-working space background, polished studio light",

  unisexe:
    "a trendy gender-neutral person in their 20s, " +
    "wearing the t-shirt, minimalist style, " +
    "clean white studio background, editorial fashion lighting",

  couple:
    "a couple in their late 20s, both wearing matching t-shirts, " +
    "arms around each other, candid natural pose, " +
    "warm lifestyle setting, golden hour light",
};

// ─── Build the mockup prompt ──────────────────────────────────────
// nano-banana-2 receives BOTH the prompt AND the design as image_input.
// The prompt instructs it to render the design onto the shirt.
function buildMockupPrompt(scene: string): string {
  return (
    // Scene
    `Fashion lifestyle photo: ${scene}. ` +
    // Design placement — key instruction
    `The t-shirt has the provided reference graphic printed in full color ` +
    `centered on the chest — reproduce the exact design, colors, and details ` +
    `from the reference image faithfully on the fabric. ` +
    // Photography quality
    `Camera: Canon EOS R5, 85mm f/1.8 lens, shallow depth of field. ` +
    `Lighting: professional softbox studio light or soft natural window light. ` +
    `Style: high-end fashion e-commerce photography, sharp fabric detail, ` +
    `true-to-life garment texture, realistic fabric drape. ` +
    // Background
    `Background: clean, minimal, slightly blurred. ` +
    // Output
    `Full-body or three-quarter crop. Photorealistic. Commercial quality. ` +
    `16:9 or 3:2 landscape format.`
  );
}

function buildCustomPrompt(custom: string): string {
  const sanitized = custom
    .trim()
    .slice(0, 200)
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\s+/g, " ");
  return (
    `Fashion lifestyle photo: ${sanitized}. ` +
    `The t-shirt has the provided reference graphic printed in full color ` +
    `centered on the chest — reproduce the exact design from the reference image faithfully. ` +
    `High quality product photography, professional lighting, realistic fabric texture. ` +
    `Commercial fashion photography quality.`
  );
}

// ─── Upload design base64 to R2, return public URL ───────────────
async function uploadDesignToR2(base64: string): Promise<string> {
  const key = await uploadImageToR2(base64, "temp-mockups");
  const url = await getR2Url(key);
  if (!url || url === key) {
    throw new Error("R2 public domain not configured — cannot serve design URL to kie.ai");
  }
  return url;
}

// ─── Submit one nano-banana-2 task ───────────────────────────────
async function submitTask(prompt: string, designUrl: string): Promise<string | null> {
  try {
    const body = {
      model: "nano-banana-2",
      input: {
        prompt,
        image_input: [designUrl],
        aspect_ratio: "3:2",
        output_format: "jpg",
        resolution: "1K",
        google_search: false,
      },
    };

    const res = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`Task submit failed (${res.status}): ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    return data.data?.taskId ?? null;
  } catch (e) {
    console.error("Submit error:", e);
    return null;
  }
}

// ─── Poll task until done ─────────────────────────────────────────
async function pollTask(taskId: string, maxWaitMs = 120_000): Promise<string[]> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const res = await fetch(
        `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`,
        { headers: { Authorization: `Bearer ${KIE_AI_API_KEY}` } },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const record = data.data;
      if (!record) continue;
      if (record.state === "success") {
        const result = JSON.parse(record.resultJson || "{}");
        return Array.isArray(result.resultUrls) ? result.resultUrls : [];
      }
      if (record.state === "fail") {
        console.error(`Task ${taskId} failed: ${record.failCode} — ${record.failMsg}`);
        return [];
      }
    } catch (e) {
      console.error(`Poll error ${taskId}:`, e);
    }
  }
  console.error(`Task ${taskId} timed out`);
  return [];
}

// ─── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designImageBase64, gender, customPrompt } = body;

    if (!designImageBase64) {
      return NextResponse.json({ error: "Design image is required" }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ error: "Audience option is required" }, { status: 400 });
    }
    if (gender === "custom") {
      if (!customPrompt?.trim()) {
        return NextResponse.json({ error: "Custom prompt is required" }, { status: 400 });
      }
      if (customPrompt.length > 200) {
        return NextResponse.json({ error: "Custom prompt must be 200 characters or less" }, { status: 400 });
      }
    } else if (!SCENES[gender]) {
      return NextResponse.json({ error: "Invalid audience option" }, { status: 400 });
    }

    // ── Upload design to R2 for public URL ──────────────────────
    console.log("\n=== Mockup Generation (nano-banana-2) ===");
    console.log("Audience:", gender);

    let designUrl: string;
    try {
      designUrl = await uploadDesignToR2(designImageBase64);
      console.log("Design uploaded to R2:", designUrl);
    } catch (uploadErr: any) {
      // R2 not available — fall back to text-only (no image_input)
      console.warn("R2 upload failed, falling back to text-only:", uploadErr.message);
      designUrl = "";
    }

    // ── Build prompt ────────────────────────────────────────────
    const prompt =
      gender === "custom"
        ? buildCustomPrompt(customPrompt)
        : buildMockupPrompt(SCENES[gender]);
    console.log("Prompt:", prompt);

    // ── Submit 4 tasks in parallel ───────────────────────────────
    const taskIds = await Promise.all(
      Array.from({ length: 4 }, () =>
        submitTask(
          prompt,
          designUrl || "https://static.aiquickdraw.com/tools/example/1772164675129_TZfXY2Sn.png",
        ),
      ),
    );
    console.log(`Tasks submitted: ${taskIds.filter(Boolean).length}/4`);

    // ── Poll all tasks concurrently ──────────────────────────────
    const urlArrays = await Promise.all(
      taskIds.map((id) => (id ? pollTask(id) : Promise.resolve([]))),
    );

    let images = urlArrays.flatMap((urls) => urls.slice(0, 1));
    console.log(`Mockups collected: ${images.length}`);

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No mockups were generated. Please try again." },
        { status: 500 },
      );
    }

    while (images.length < 4) {
      images.push(images[images.length - 1]);
    }

    return NextResponse.json({ success: true, images: images.slice(0, 4) });
  } catch (error: any) {
    console.error("Mockup generation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
