import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const FREE_DAILY_LIMIT_DEFAULT = 3;
const PREMIUM_DAILY_LIMIT_DEFAULT = 50;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, aiTier: true, aiPremiumLimit: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  // Get configured limits
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "freeAiGenerationsPerDay",
          "premiumAiGenerationsPerDay",
          "contactPhone",
        ],
      },
    },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const freeLimit = parseInt(
    map["freeAiGenerationsPerDay"] ?? String(FREE_DAILY_LIMIT_DEFAULT),
  );
  const premiumLimit = parseInt(
    map["premiumAiGenerationsPerDay"] ?? String(PREMIUM_DAILY_LIMIT_DEFAULT),
  );
  const contactPhone = map["contactPhone"] ?? "+216 24 268 377";

  const dailyLimit =
    user.aiTier === "PREMIUM"
      ? (user.aiPremiumLimit ?? premiumLimit)
      : freeLimit;

  // Count today's usage
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const used = await prisma.aiGenerationLog.count({
    where: { userId: user.id, createdAt: { gte: startOfDay } },
  });

  return NextResponse.json({
    used,
    limit: dailyLimit,
    tier: user.aiTier,
    contactPhone,
    remaining: Math.max(0, dailyLimit - used),
  });
}
