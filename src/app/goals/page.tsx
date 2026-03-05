"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Sparkles, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  frequency: string;
  depositAmount: number;
  isCompleted: boolean;
}

const GOAL_EMOJIS = ["🎮", "📱", "🚲", "📚", "🎸", "⚽", "🎨", "✈️", "🏠", "🎁"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    frequency: "weekly",
    depositAmount: "",
    emoji: "🎯",
  });

  const loadGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    if (res.ok) setGoals(await res.json());
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const createGoal = async () => {
    if (!form.title || !form.targetAmount || !form.depositAmount) return;

    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        depositAmount: parseFloat(form.depositAmount),
      }),
    });

    setForm({
      title: "",
      targetAmount: "",
      frequency: "weekly",
      depositAmount: "",
      emoji: "🎯",
    });
    setShowCreate(false);
    loadGoals();
    showToast("New goal created! Let's start saving!");
  };

  const makeDeposit = async (goalId: string) => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        amount,
        type: "deposit",
        description: "Savings deposit",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setShowDeposit(null);
      setDepositAmount("");
      loadGoals();
      showToast(
        `+${data.xpEarned} XP earned! Streak: ${data.newStreak} days`
      );
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="p-4 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-bounce-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-gray-800">Savings Goals</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Create Savings Goal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Choose an icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`text-2xl p-2 rounded-xl transition-all ${
                        form.emoji === e
                          ? "bg-emerald-100 scale-110"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="What are you saving for?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />

              <input
                type="number"
                placeholder="Target amount ($)"
                value={form.targetAmount}
                onChange={(e) =>
                  setForm({ ...form, targetAmount: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setForm({ ...form, frequency: "daily" })}
                  className={`flex-1 p-3 rounded-xl text-sm font-medium transition-colors ${
                    form.frequency === "daily"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Save Daily
                </button>
                <button
                  onClick={() => setForm({ ...form, frequency: "weekly" })}
                  className={`flex-1 p-3 rounded-xl text-sm font-medium transition-colors ${
                    form.frequency === "weekly"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Save Weekly
                </button>
              </div>

              <input
                type="number"
                placeholder={`Amount per ${form.frequency === "daily" ? "day" : "week"} ($)`}
                value={form.depositAmount}
                onChange={(e) =>
                  setForm({ ...form, depositAmount: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createGoal}
                  className="flex-1 p-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles size={48} className="mx-auto text-emerald-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Start Your Savings Journey!
          </h2>
          <p className="text-gray-400 max-w-xs mx-auto">
            Create your first goal and earn XP as you save. Every little bit
            counts!
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
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(goal.depositAmount)} /{" "}
                        {goal.frequency}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeposit(goal.id);
                      setDepositAmount(goal.depositAmount.toString());
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    + Save
                  </button>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                {/* Deposit Modal */}
                {showDeposit === goal.id && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                    <p className="text-sm font-medium text-emerald-700 mb-2">
                      How much to save today?
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => makeDeposit(goal.id)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                      >
                        Save!
                      </button>
                      <button
                        onClick={() => setShowDeposit(null)}
                        className="text-gray-400 px-2"
                      >
                        x
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Check size={20} className="text-emerald-500" />
            Completed Goals
          </h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{goal.emoji}</span>
                  <span className="font-semibold text-emerald-700">
                    {goal.title}
                  </span>
                  <span className="ml-auto text-sm text-emerald-600 font-medium">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
