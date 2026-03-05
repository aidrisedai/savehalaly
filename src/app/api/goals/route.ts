import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json([], { status: 404 });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      title: body.title,
      targetAmount: body.targetAmount,
      frequency: body.frequency,
      depositAmount: body.depositAmount,
      emoji: body.emoji || "🎯",
    },
  });

  return NextResponse.json(goal);
}
