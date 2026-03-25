import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { aiTier, aiPremiumLimit } = body;

  if (!["FREE", "PREMIUM"].includes(aiTier)) {
    return NextResponse.json({ error: "Tier invalide" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      aiTier,
      aiPremiumLimit: aiTier === "PREMIUM" && aiPremiumLimit != null
        ? parseInt(aiPremiumLimit)
        : null,
    },
    select: { id: true, email: true, aiTier: true, aiPremiumLimit: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
