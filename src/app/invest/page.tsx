"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Shield, Zap, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvestmentOption {
  name: string;
  returnRate: number;
  risk: string;
}

interface Investment {
  id: string;
  name: string;
  amount: number;
  returnRate: number;
  startDate: string;
  currentValue: number;
  profit: number;
}

const RISK_ICONS: Record<string, typeof Shield> = {
  Low: Shield,
  Medium: TrendingUp,
  High: Zap,
};

const RISK_COLORS: Record<string, string> = {
  Low: "text-emerald-500 bg-emerald-50",
  Medium: "text-amber-500 bg-amber-50",
  High: "text-red-500 bg-red-50",
};

export default function InvestPage() {
  const [options, setOptions] = useState<InvestmentOption[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selected, setSelected] = useState<InvestmentOption | null>(null);
  const [amount, setAmount] = useState("");
  const [totalSaved, setTotalSaved] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [invRes, userRes] = await Promise.all([
      fetch("/api/investments"),
      fetch("/api/users"),
    ]);
    if (invRes.ok) {
      const data = await invRes.json();
      setOptions(data.options);
      setInvestments(data.investments);
    }
    if (userRes.ok) {
      const user = await userRes.json();
      setTotalSaved(user.totalSaved);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const makeInvestment = async () => {
    if (!selected || !amount) return;
    const investAmount = parseFloat(amount);

    if (investAmount > totalSaved) {
      showToast("Not enough savings to invest this amount");
      return;
    }

    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: selected.name,
        amount: investAmount,
        returnRate: selected.returnRate,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSelected(null);
      setAmount("");
      loadData();
      showToast(`Investment made! +${data.xpEarned} XP earned`);
    }
  };

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalProfit = totalValue - totalInvested;

  return (
    <div className="p-4 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-bounce-in">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 pt-2">Invest & Grow</h1>

      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm">Your Portfolio</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        <div className="flex items-center gap-4 mt-3">
          <div>
            <p className="text-xs text-blue-200">Invested</p>
            <p className="text-sm font-medium">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-200">Profit</p>
            <p
              className={`text-sm font-medium ${
                totalProfit >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Users size={20} className="text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 text-sm">
              Learn About Halal Investing
            </h3>
            <p className="text-xs text-blue-600 mt-1">
              All investment options here follow Islamic finance principles. No
              interest (riba) — instead, you share in the profits of real
              businesses and projects!
            </p>
          </div>
        </div>
      </div>

      {/* Investment Options */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Investment Options
        </h2>
        <div className="space-y-3">
          {options.map((opt) => {
            const RiskIcon = RISK_ICONS[opt.risk] || Shield;
            const riskColor = RISK_COLORS[opt.risk] || RISK_COLORS.Low;
            const isSelected = selected?.name === opt.name;

            return (
              <button
                key={opt.name}
                onClick={() => setSelected(isSelected ? null : opt)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{opt.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-emerald-600 font-medium">
                        {(opt.returnRate * 100).toFixed(0)}% annual return
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${riskColor}`}
                      >
                        <RiskIcon size={12} />
                        {opt.risk} Risk
                      </span>
                    </div>
                  </div>
                  <TrendingUp
                    size={20}
                    className={isSelected ? "text-blue-500" : "text-gray-300"}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invest Form */}
      {selected && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-slide-up">
          <p className="text-sm text-gray-500 mb-1">
            Investing in: <strong>{selected.name}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Available: {formatCurrency(totalSaved)}
          </p>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-3">
            {[5, 10, 25, 50].map((q) => (
              <button
                key={q}
                onClick={() => setAmount(q.toString())}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  amount === q.toString()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ${q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
            />
            <button
              onClick={makeInvestment}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Invest
            </button>
          </div>
        </div>
      )}

      {/* Active Investments */}
      {investments.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Your Investments
          </h2>
          <div className="space-y-3">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{inv.name}</p>
                  <span
                    className={`text-sm font-medium ${
                      inv.profit >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {inv.profit >= 0 ? "+" : ""}
                    {formatCurrency(inv.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Invested: {formatCurrency(inv.amount)}</span>
                  <span>
                    Current: {formatCurrency(inv.currentValue)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{
                      width: `${Math.min(
                        (inv.currentValue / inv.amount) * 50,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
