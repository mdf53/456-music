import { apiClient } from "./apiClient";

const MAX_IMAGE_BYTES = 2_000_000;

function normalizeMime(header: string | null): string {
  const raw = header?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (raw === "image/jpg") return "image/jpeg";
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  return allowed.has(raw) ? raw : "image/jpeg";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const btoaFn = globalThis.btoa;
  if (typeof btoaFn !== "function") {
    throw new Error("btoa is not available");
  }
  return btoaFn(binary);
}

/**
 * Download Spotify's public profile image and store it as this user's profile photo (Mongo).
 * Returns a data URL for immediate UI use, or null if upload failed / no image.
 */
export async function uploadSpotifyProfileImageFromUrl(
  spotifyUserId: string,
  imageUrl: string
): Promise<string | null> {
  const url = imageUrl.trim();
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mimeType = normalizeMime(res.headers.get("content-type"));
    const ab = await res.arrayBuffer();
    if (ab.byteLength === 0 || ab.byteLength > MAX_IMAGE_BYTES) return null;
    const imageBase64 = bytesToBase64(new Uint8Array(ab));
    await apiClient.putProfilePhoto(spotifyUserId, { imageBase64, mimeType });
    return `data:${mimeType};base64,${imageBase64}`;
  } catch (e) {
    console.warn("[spotifyProfilePhotoSync] upload failed", e);
    return null;
  }
}
