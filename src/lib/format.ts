const DAY_MS = 86_400_000;

export function describeAge(from: Date, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - from.getTime()) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}