/**
 * Returns days remaining until a given ISO date string.
 * Returns null for lifetime (no expiry).
 */
export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns expiry badge info based on days remaining.
 */
export function getExpiryBadge(expiresAt?: string): {
  label: string;
  color: string;
  bg: string;
  border: string;
  urgent: boolean;
} {
  const days = daysUntil(expiresAt);

  if (days === null) {
    return {
      label: "Lifetime ♾",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      urgent: false,
    };
  }

  if (days <= 0) {
    return {
      label: "Expired",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      urgent: true,
    };
  }

  if (days <= 3) {
    return {
      label: `${days}d left`,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      urgent: true,
    };
  }

  if (days <= 7) {
    return {
      label: `${days}d left`,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      urgent: true,
    };
  }

  if (days <= 14) {
    return {
      label: `${days}d left`,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      urgent: false,
    };
  }

  return {
    label: `${days}d left`,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    urgent: false,
  };
}
