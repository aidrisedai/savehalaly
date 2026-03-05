"use client";

import { getLevelInfo } from "@/lib/gamification";

interface XpBarProps {
  xp: number;
}

export default function XpBar({ xp }: XpBarProps) {
  const { currentLevel, nextLevel, progress } = getLevelInfo(xp);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-emerald-700">
          Lv.{currentLevel.level} {currentLevel.title}
        </span>
        <span className="text-xs text-gray-500">{xp} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextLevel && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {nextLevel.xpRequired - xp} XP to {nextLevel.title}
        </p>
      )}
    </div>
  );
}
