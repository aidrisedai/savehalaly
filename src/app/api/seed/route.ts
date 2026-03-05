import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

export async function POST() {
  // Create demo user if none exists
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    return NextResponse.json(existingUser);
  }

  // Seed badges
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        xpReward: badge.xpReward,
        requirement: JSON.stringify({ check: badge.name }),
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      name: "Yusuf",
      age: 12,
      avatar: "🧒",
    },
  });

  return NextResponse.json(user);
}
