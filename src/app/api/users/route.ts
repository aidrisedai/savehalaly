import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await prisma.user.findFirst({
    include: {
      savingsGoals: true,
      badges: { include: { badge: true } },
      investments: true,
      donations: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(user);
}
