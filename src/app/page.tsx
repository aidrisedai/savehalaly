"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, Trophy, Star, Coins } from "lucide-react";
import XpBar from "@/components/XpBar";
import ProgressRing from "@/components/ProgressRing";
import { formatCurrency } from "@/lib/utils";

interface UserData {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  totalSaved: number;
  savingsGoals: Array<{
    id: string;
    title: string;
    emoji: string;
    targetAmount: number;
    currentAmount: number;
    isCompleted: boolean;
  }>;
  badges: Array<{
    badge: { name: string; icon: string; description: string };
    earnedAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    let res = await fetch("/api/users");
    if (res.status === 404) {
      await fetch("/api/seed", { method: "POST" });
      res = await fetch("/api/users");
    }
    if (res.ok) {
      setUser(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce-in">🌟</div>
          <p className="text-gray-500">Loading your savings...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeGoals = user.savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = user.savingsGoals.filter((g) => g.isCompleted);
  const overallProgress =
    activeGoals.length > 0
      ? activeGoals.reduce(
          (acc, g) => acc + (g.currentAmount / g.targetAmount) * 100,
          0
        ) / activeGoals.length
      : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Salaam, {user.name}! {user.avatar}
          </h1>
          <p className="text-sm text-gray-500">Let&apos;s grow your savings today</p>
        </div>
        <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-600">
            {user.streak}
          </span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <XpBar xp={user.xp} />
      </div>

      {/* Savings Overview */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Total Savings</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(user.totalSaved)}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Trophy size={14} />
                <span className="text-sm">
                  {completedGoals.length} goals done
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} />
                <span className="text-sm">{user.badges.length} badges</span>
              </div>
            </div>
          </div>
          <ProgressRing progress={overallProgress} size={90} strokeWidth={6}>
            <div className="text-center">
              <Coins size={20} className="mx-auto text-emerald-100" />
              <span className="text-xs font-medium">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <p className="text-gray-400">
              No active goals yet. Create one to start saving!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const pct = Math.min(
                (goal.currentAmount / goal.targetAmount) * 100,
                100
              );
              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slide-up"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <span className="font-semibold text-gray-800">
                        {goal.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-right">
                    {Math.round(pct)}% complete
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Your Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((ub, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center min-w-[80px]"
              >
                <span className="text-2xl">{ub.badge.icon}</span>
                <span className="text-xs font-medium text-gray-600 mt-1 text-center">
                  {ub.badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {user.transactions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {user.transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.type === "deposit"
                        ? "bg-emerald-100 text-emerald-600"
                        : tx.type === "donation" || tx.type === "zakat"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {tx.type === "deposit"
                      ? "+"
                      : tx.type === "investment"
                      ? "~"
                      : "-"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "deposit"
                      ? "text-emerald-600"
                      : "text-gray-600"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
