import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { calculateLevel } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

  const { type, amount, recipient } = body;

  if (amount > user.totalSaved) {
    return NextResponse.json(
      { error: "Insufficient savings" },
      { status: 400 }
    );
  }

  const donation = await prisma.donation.create({
    data: {
      userId: user.id,
      type,
      amount,
      recipient,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type,
      amount,
      description: `${type === "zakat" ? "Zakat" : "Charity"} to ${recipient}`,
    },
  });

  // XP reward for generosity
  const xpReward = type === "zakat" ? 75 : 50;
  const newXp = user.xp + xpReward;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalSaved: user.totalSaved - amount,
      xp: newXp,
      level: calculateLevel(newXp),
    },
  });

  return NextResponse.json({ donation, xpEarned: xpReward });
}

export async function GET() {
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json([], { status: 404 });

  const donations = await prisma.donation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(donations);
}
