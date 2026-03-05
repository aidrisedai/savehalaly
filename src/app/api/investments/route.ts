import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { calculateLevel } from "@/lib/gamification";

const INVESTMENT_OPTIONS = [
  { name: "Halal Growth Fund", returnRate: 0.08, risk: "Medium" },
  { name: "Islamic Savings Bond", returnRate: 0.04, risk: "Low" },
  { name: "Youth Entrepreneur Fund", returnRate: 0.12, risk: "High" },
  { name: "Community Development Fund", returnRate: 0.06, risk: "Low" },
];

export async function GET() {
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ options: INVESTMENT_OPTIONS, investments: [] });

  const investments = await prisma.investment.findMany({
    where: { userId: user.id, isActive: true },
  });

  // Calculate current values
  const enriched = investments.map((inv) => {
    const daysSinceStart =
      (Date.now() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24);
    const dailyRate = inv.returnRate / 365;
    const currentValue = inv.amount * (1 + dailyRate * daysSinceStart);
    return { ...inv, currentValue, profit: currentValue - inv.amount };
  });

  return NextResponse.json({ options: INVESTMENT_OPTIONS, investments: enriched });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

  const { name, amount, returnRate } = body;

  if (amount > user.totalSaved) {
    return NextResponse.json(
      { error: "Insufficient savings" },
      { status: 400 }
    );
  }

  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      name,
      amount,
      returnRate,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "investment",
      amount,
      description: `Invested in ${name}`,
    },
  });

  const xpReward = 50;
  const newXp = user.xp + xpReward;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalSaved: user.totalSaved - amount,
      xp: newXp,
      level: calculateLevel(newXp),
    },
  });

  return NextResponse.json({ investment, xpEarned: xpReward });
}
