import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToR2, getR2Url } from "@/lib/storage";

const GEMINI_MODEL = "gemini-3.1-flash-image-preview";
const FREE_DAILY_LIMIT_DEFAULT = 3;
const IMAGES_PER_GENERATION = 2;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
function buildDesignPrompt(userPrompt: string): string {
  return (
    `${userPrompt}. ` +
    `Art style: bold vector graphic illustration, strong clean black outlines, ` +
    `flat solid vibrant colors, no photorealism, no gradients on the subject. ` +
    `BACKGROUND: pure solid white (#FFFFFF) only — completely empty, ` +
    `no texture, no noise, no pattern, no vignette, no scenery. ` +
    `Subject fully isolated like a sticker or die-cut decal. ` +
    `No drop shadows, no glow, no cast shadows, no reflections. ` +
    `Centered single subject, tight crop with minimal white padding. ` +
    `No t-shirt, no clothing, no mannequin, no human body, no frame, no border. ` +
    `Print-ready PNG artwork, sharp crisp edges, 1000x1000px minimum quality. ` +
    `Professional graphic design for apparel screen printing.`
  );
}

// ─── Generate a single image via Gemini ──────────────────────────
async function generateOneImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseModalities: ["IMAGE", "TEXT"] },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if ((part as any).inlineData?.data) {
        const inlineData = (part as any).inlineData;
        const base64 = inlineData.data as string;
        const mimeType: string = inlineData.mimeType || "image/png";
        const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";

        // Upload to R2 and return public URL
        const key = await uploadImageToR2Base64(base64, ext);
        return await getR2Url(key);
      }
    }
    console.error("Gemini returned no image part");
    return null;
  } catch (e: any) {
    console.error("Gemini generateContent error:", e?.message ?? e);
    return null;
  }
}

// ─── Upload raw base64 (no header) to R2 ─────────────────────────
async function uploadImageToR2Base64(base64: string, ext: string): Promise<string> {
  const dataUrl = `data:image/${ext};base64,${base64}`;
  return uploadImageToR2(dataUrl, "ai-designs");
}

// ─── Get today's generation count for a user ─────────────────────
async function getTodayCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return prisma.aiGenerationLog.count({
    where: { userId, createdAt: { gte: startOfDay } },
  });
}

// ─── Get daily limits from settings ──────────────────────────────
async function getLimits(): Promise<{ free: number; premium: number }> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["freeAiGenerationsPerDay", "premiumAiGenerationsPerDay"] } },
  });
  const map: Record<string, number> = {};
  for (const s of settings) map[s.key] = parseFloat(s.value);
  return {
    free: map["freeAiGenerationsPerDay"] ?? FREE_DAILY_LIMIT_DEFAULT,
    premium: map["premiumAiGenerationsPerDay"] ?? 50,
  };
}

// ─── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, aiTier: true, aiPremiumLimit: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Check daily limit
  const limits = await getLimits();
  const dailyLimit =
    user.aiTier === "PREMIUM"
      ? (user.aiPremiumLimit ?? limits.premium)
      : limits.free;

  const todayCount = await getTodayCount(user.id);
  if (todayCount >= dailyLimit) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        used: todayCount,
        limit: dailyLimit,
        tier: user.aiTier,
      },
      { status: 429 },
    );
  }

  // Validate prompt
  const body = await request.json();
  const { prompt } = body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt requis" }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Le prompt ne doit pas dépasser 500 caractères" },
      { status: 400 },
    );
  }

  const finalPrompt = buildDesignPrompt(sanitize(prompt));
  console.log(`\n=== Design Generation (Gemini Flash) ===`);
  console.log("User:", user.id, "| Tier:", user.aiTier, "| Today:", todayCount + 1, "/", dailyLimit);
  console.log("Prompt:", prompt.trim());

  // Generate IMAGES_PER_GENERATION images in parallel
  const results = await Promise.all(
    Array.from({ length: IMAGES_PER_GENERATION }, () => generateOneImage(finalPrompt)),
  );

  const images = results.filter((url): url is string => url !== null);
  console.log(`Images generated: ${images.length}/${IMAGES_PER_GENERATION}`);

  if (images.length === 0) {
    return NextResponse.json(
      { error: "Aucune image générée. Vérifiez les logs du serveur." },
      { status: 500 },
    );
  }

  // Fill to 4 if some failed
  while (images.length < IMAGES_PER_GENERATION) {
    images.push(images[images.length - 1]);
  }

  // Log this generation (counts as 1 use)
  await prisma.aiGenerationLog.create({ data: { userId: user.id } });

  return NextResponse.json({
    success: true,
    images: images.slice(0, IMAGES_PER_GENERATION),
    used: todayCount + 1,
    limit: dailyLimit,
    tier: user.aiTier,
  });
}
