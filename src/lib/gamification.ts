export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Penny Starter" },
  { level: 2, xpRequired: 100, title: "Coin Collector" },
  { level: 3, xpRequired: 300, title: "Savings Scout" },
  { level: 4, xpRequired: 600, title: "Money Mapper" },
  { level: 5, xpRequired: 1000, title: "Budget Builder" },
  { level: 6, xpRequired: 1500, title: "Wealth Warrior" },
  { level: 7, xpRequired: 2200, title: "Finance Hero" },
  { level: 8, xpRequired: 3000, title: "Savings Superstar" },
  { level: 9, xpRequired: 4000, title: "Money Master" },
  { level: 10, xpRequired: 5500, title: "Halal Tycoon" },
];

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpForNextLevel = nextLevel
    ? nextLevel.xpRequired - currentLevel.xpRequired
    : 0;
  const progress = nextLevel ? (xpIntoLevel / xpForNextLevel) * 100 : 100;

  return { currentLevel, nextLevel, progress, xpIntoLevel, xpForNextLevel };
}

export function calculateXpForDeposit(amount: number, streak: number): number {
  const baseXp = Math.floor(amount * 2);
  const streakBonus = Math.min(streak, 7) * 5;
  return baseXp + streakBonus;
}

export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i].level;
  }
  return 1;
}

export const BADGE_DEFINITIONS = [
  {
    name: "First Save",
    description: "Made your very first deposit!",
    icon: "🌱",
    xpReward: 50,
    check: (stats: { totalDeposits: number }) => stats.totalDeposits >= 1,
  },
  {
    name: "Week Warrior",
    description: "Saved for 7 days in a row!",
    icon: "🔥",
    xpReward: 100,
    check: (stats: { streak: number }) => stats.streak >= 7,
  },
  {
    name: "Goal Getter",
    description: "Completed your first savings goal!",
    icon: "🏆",
    xpReward: 200,
    check: (stats: { completedGoals: number }) => stats.completedGoals >= 1,
  },
  {
    name: "Generous Heart",
    description: "Made your first charity donation!",
    icon: "💝",
    xpReward: 150,
    check: (stats: { totalDonations: number }) => stats.totalDonations >= 1,
  },
  {
    name: "Zakat Champion",
    description: "Gave your first zakat!",
    icon: "🌙",
    xpReward: 150,
    check: (stats: { totalZakat: number }) => stats.totalZakat >= 1,
  },
  {
    name: "Young Investor",
    description: "Made your first investment!",
    icon: "📈",
    xpReward: 150,
    check: (stats: { totalInvestments: number }) => stats.totalInvestments >= 1,
  },
  {
    name: "Century Saver",
    description: "Saved a total of $100!",
    icon: "💰",
    xpReward: 300,
    check: (stats: { totalSaved: number }) => stats.totalSaved >= 100,
  },
  {
    name: "Month Master",
    description: "Saved for 30 days in a row!",
    icon: "⭐",
    xpReward: 500,
    check: (stats: { streak: number }) => stats.streak >= 30,
  },
];
