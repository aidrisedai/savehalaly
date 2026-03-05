export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getStreakStatus(lastSaveAt: Date | null, frequency: string): "active" | "expiring" | "broken" {
  if (!lastSaveAt) return "broken";

  const now = new Date();
  const diff = now.getTime() - new Date(lastSaveAt).getTime();
  const hours = diff / (1000 * 60 * 60);

  if (frequency === "daily") {
    if (hours < 24) return "active";
    if (hours < 48) return "expiring";
    return "broken";
  } else {
    if (hours < 168) return "active";
    if (hours < 336) return "expiring";
    return "broken";
  }
}
