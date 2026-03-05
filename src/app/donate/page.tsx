"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Moon, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Donation {
  id: string;
  type: string;
  amount: number;
  recipient: string;
  createdAt: string;
}

const CHARITIES = [
  { name: "Local Food Bank", description: "Feed families in your community", icon: "🍲" },
  { name: "Children's Education Fund", description: "Help kids go to school", icon: "📚" },
  { name: "Clean Water Project", description: "Bring clean water to villages", icon: "💧" },
  { name: "Animal Shelter", description: "Care for rescued animals", icon: "🐾" },
];

const ZAKAT_INFO = {
  title: "Zakat Calculator",
  description:
    "Zakat is 2.5% of your savings held for one year. It purifies your wealth and helps those in need.",
  recipients: [
    { name: "The Poor (Al-Fuqara)", icon: "🤲" },
    { name: "The Needy (Al-Masakin)", icon: "🏠" },
    { name: "Zakat Foundation", icon: "🌙" },
  ],
};

export default function DonatePage() {
  const [tab, setTab] = useState<"charity" | "zakat">("charity");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [amount, setAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [totalSaved, setTotalSaved] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [donRes, userRes] = await Promise.all([
      fetch("/api/donations"),
      fetch("/api/users"),
    ]);
    if (donRes.ok) setDonations(await donRes.json());
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

  const makeDonation = async () => {
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0 || !selectedRecipient) return;

    if (donationAmount > totalSaved) {
      showToast("Not enough savings for this donation");
      return;
    }

    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: tab,
        amount: donationAmount,
        recipient: selectedRecipient,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setAmount("");
      setSelectedRecipient("");
      loadData();
      showToast(
        `${tab === "zakat" ? "Zakat" : "Donation"} sent! +${data.xpEarned} XP`
      );
    }
  };

  const zakatAmount = totalSaved * 0.025;

  const totalCharity = donations
    .filter((d) => d.type === "charity")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalZakat = donations
    .filter((d) => d.type === "zakat")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-4 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-bounce-in">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 pt-2">Give Back</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <Heart size={20} className="text-purple-500 mb-1" />
          <p className="text-xs text-purple-400">Charity Given</p>
          <p className="text-lg font-bold text-purple-700">
            {formatCurrency(totalCharity)}
          </p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <Moon size={20} className="text-amber-500 mb-1" />
          <p className="text-xs text-amber-400">Zakat Given</p>
          <p className="text-lg font-bold text-amber-700">
            {formatCurrency(totalZakat)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("charity")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "charity"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Charity
        </button>
        <button
          onClick={() => setTab("zakat")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "zakat"
              ? "bg-white text-amber-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Zakat
        </button>
      </div>

      {tab === "charity" ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Choose a cause and make a difference!
          </p>
          {CHARITIES.map((charity) => (
            <button
              key={charity.name}
              onClick={() => setSelectedRecipient(charity.name)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedRecipient === charity.name
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-100 bg-white hover:border-purple-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{charity.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{charity.name}</p>
                  <p className="text-xs text-gray-400">
                    {charity.description}
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-1">
              {ZAKAT_INFO.title}
            </h3>
            <p className="text-sm text-amber-600 mb-2">
              {ZAKAT_INFO.description}
            </p>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400">
                Your suggested zakat (2.5%)
              </p>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrency(zakatAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {ZAKAT_INFO.recipients.map((r) => (
              <button
                key={r.name}
                onClick={() => setSelectedRecipient(r.name)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRecipient === r.name
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-100 bg-white hover:border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-medium text-gray-700">{r.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount + Submit */}
      {selectedRecipient && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-slide-up">
          <p className="text-sm text-gray-500 mb-2">
            Donating to: <strong>{selectedRecipient}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Available: {formatCurrency(totalSaved)}
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
            />
            <button
              onClick={makeDonation}
              className={`px-6 py-3 rounded-xl text-white font-medium transition-colors ${
                tab === "charity"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              Give
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {donations.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Giving History
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {donations.slice(0, 10).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {d.recipient}
                  </p>
                  <p className="text-xs text-gray-400">
                    {d.type === "zakat" ? "Zakat" : "Charity"} &middot;{" "}
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {formatCurrency(d.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
