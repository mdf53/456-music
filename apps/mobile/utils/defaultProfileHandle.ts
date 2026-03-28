/**
 * Proposed @handle for new users: Spotify explicit username if present, else display name,
 * slugified + 4 random digits (server rules: [a-z0-9_]{3,30}).
 */
export function buildDefaultProfileHandleCandidate(user: {
  displayName: string;
  explicitUsername?: string;
}): string {
  const raw =
    (user.explicitUsername && user.explicitUsername.trim()) ||
    (user.displayName && user.displayName.trim()) ||
    "listener";
  let base = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (base.length < 3) base = "user";
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const maxBaseLen = Math.max(3, 30 - suffix.length);
  if (base.length > maxBaseLen) {
    base = base.slice(0, maxBaseLen).replace(/_+$/g, "") || "usr";
  }
  if (base.length < 3) base = (base + "xxx").slice(0, 3);
  return (base + suffix).slice(0, 30);
}
