import { NextRequest, NextResponse } from "next/server";
import { getActiveModel } from "@/lib/kie-ai-models";

const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;
if (!KIE_AI_API_KEY) {
  throw new Error("KIE_AI_API_KEY environment variable is not set");
}

const KIE_API_BASE = "https://api.kie.ai";

// ─── Sanitize user prompt ─────────────────────────────────────────
function sanitize(input: string): string {
  return input
    .trim()
    .slice(0, 500)
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Build the final prompt ───────────────────────────────────────
// Goal: isolated graphic artwork on a pure white background,
// no t-shirt, ready to be placed on a garment in the editor.
function buildDesignPrompt(userPrompt: string): string {
  return (
    `${userPrompt}. ` +
    // Style
    `Art style: bold vector graphic illustration, strong clean black outlines, ` +
    `flat solid vibrant colors, no photorealism, no gradients on the subject. ` +
    // Background — the single most critical instruction
    `BACKGROUND: pure solid white (#FFFFFF) only — completely empty, ` +
    `no texture, no noise, no pattern, no vignette, no scenery. ` +
    // Isolation
    `Subject fully isolated like a sticker or die-cut decal. ` +
    `No drop shadows, no glow, no cast shadows, no reflections. ` +
    // Composition
    `Centered single subject, tight crop with minimal white padding. ` +
    // What NOT to include
    `No t-shirt, no clothing, no mannequin, no human body, no frame, no border. ` +
    // Output quality
    `Print-ready PNG artwork, sharp crisp edges, 1000x1000px minimum quality. ` +
    `Professional graphic design for apparel screen printing.`
  );
}

// ─── Build model-specific input payload ──────────────────────────
function buildInput(modelId: string, prompt: string): object {
  if (modelId === "nano-banana-2") {
    return {
      prompt,
      aspect_ratio: "1:1",
      output_format: "png",
      resolution: "1K",
      google_search: false,
    };
  }
  if (modelId === "z-image") {
    return { prompt, aspect_ratio: "1:1" };
  }
  // grok-imagine/text-to-image (default)
  return { prompt, aspect_ratio: "1:1" };
}

// ─── Submit one task ──────────────────────────────────────────────
async function submitTask(prompt: string, modelId: string): Promise<string | null> {
  try {
    const res = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({ model: modelId, input: buildInput(modelId, prompt) }),
    });

    if (!res.ok) {
      console.error(`Task submit failed (${res.status}): ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const taskId = data.data?.taskId ?? null;
    if (taskId) console.log(`Design task submitted: ${taskId}`);
    return taskId;
  } catch (e) {
    console.error("Submit error:", e);
    return null;
  }
}

// ─── Poll until done, return image URLs ──────────────────────────
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
      console.error(`Poll error for ${taskId}:`, e);
    }
  }
  console.error(`Task ${taskId} timed out`);
  return [];
}

// ─── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt must be 500 characters or less" },
        { status: 400 },
      );
    }

    const model = getActiveModel();
    const finalPrompt = buildDesignPrompt(sanitize(prompt));

    console.log(`\n=== Design Generation (${model.name}) ===`);
    console.log("User prompt:", prompt.trim());

    let images: string[];

    if (model.imagesPerTask >= 4) {
      // Grok: 1 task returns up to 6 images
      const taskId = await submitTask(finalPrompt, model.id);
      const urls = taskId ? await pollTask(taskId) : [];
      images = urls.slice(0, 4);
    } else {
      // nano-banana-2 / z-image: 1 image per task, submit 4 in parallel
      const taskIds = await Promise.all(
        Array.from({ length: 4 }, () => submitTask(finalPrompt, model.id)),
      );
      console.log(`Tasks submitted: ${taskIds.filter(Boolean).length}/4`);
      const urlArrays = await Promise.all(
        taskIds.map((id) => (id ? pollTask(id) : Promise.resolve([]))),
      );
      images = urlArrays.flatMap((urls) => urls.slice(0, 1));
    }
    console.log(`Images collected: ${images.length}`);

    if (images.length === 0) {
      return NextResponse.json(
        { error: `No images returned by model "${model.name}". Check server logs for task failure details.` },
        { status: 500 },
      );
    }

    // Fill to 4 if some tasks failed
    while (images.length < 4) {
      images.push(images[images.length - 1]);
    }

    return NextResponse.json({
      success: true,
      images: images.slice(0, 4),
      model: model.name,
    });
  } catch (error: any) {
    console.error("Design generation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
