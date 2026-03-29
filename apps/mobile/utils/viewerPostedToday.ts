import type { FeedItem } from "../types";

function isSameLocalCalendarDay(isoOrMs: string, now = new Date()): boolean {
  const d = new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** True if the viewer has at least one feed post whose createdAt is today (local calendar). */
export function viewerHasSharedSongToday(
  feedItems: FeedItem[],
  profileHandle: string | null | undefined
): boolean {
  if (!profileHandle?.trim()) return false;
  const h = profileHandle.trim().toLowerCase();
  for (const item of feedItems) {
    if (item.user.trim().toLowerCase() !== h) continue;
    if (item.id.startsWith("local-")) return true;
    if (item.createdAt && isSameLocalCalendarDay(item.createdAt)) return true;
  }
  return false;
}
