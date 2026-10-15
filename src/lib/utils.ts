export { cn } from "cn";

/**
 * Slugify a string for URL-safe club slugs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 64);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) return "just now";
  if (Math.abs(diffMinutes) < 60)
    return diffMinutes > 0
      ? `in ${diffMinutes}m`
      : `${Math.abs(diffMinutes)}m ago`;
  if (Math.abs(diffHours) < 24)
    return diffHours > 0
      ? `in ${diffHours}h`
      : `${Math.abs(diffHours)}h ago`;
  if (Math.abs(diffDays) < 30)
    return diffDays > 0
      ? `in ${diffDays}d`
      : `${Math.abs(diffDays)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a date in a human-friendly way
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Generate initials from a name (e.g., "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
