import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { calculateXpForDeposit, calculateLevel } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

  const { goalId, amount, type, description } = body;

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      goalId: type === "deposit" ? goalId : null,
      type,
      amount,
      description,
    },
  });

  if (type === "deposit" && goalId) {
    // Update goal
    const goal = await prisma.savingsGoal.findUnique({ where: { id: goalId } });
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      await prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newAmount,
          isCompleted: newAmount >= goal.targetAmount,
        },
      });
    }

    // Update streak
    const now = new Date();
    const lastSave = user.lastSaveAt;
    let newStreak = user.streak;

    if (!lastSave) {
      newStreak = 1;
    } else {
      const hoursSinceLastSave =
        (now.getTime() - new Date(lastSave).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSave < 48) {
        newStreak = user.streak + 1;
      } else {
        newStreak = 1;
      }
    }

    // Calculate XP
    const xpEarned = calculateXpForDeposit(amount, newStreak);
    const newXp = user.xp + xpEarned;
    const newLevel = calculateLevel(newXp);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalSaved: user.totalSaved + amount,
        streak: newStreak,
        lastSaveAt: now,
        xp: newXp,
        level: newLevel,
      },
    });

    return NextResponse.json({ transaction, xpEarned, newStreak, newLevel });
  }

  return NextResponse.json({ transaction });
}
