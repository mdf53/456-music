import { Router, Request, Response } from "express";
import { ProfileDao } from "../dao/ProfileDao";
import { ProfilePhotoDao } from "../dao/ProfilePhotoDao";

export const profilePhotosRouter = Router();

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function parseSpotifyUserIdParam(req: Request): string {
  const raw = req.params.spotifyUserId;
  const s = Array.isArray(raw) ? raw[0] : raw;
  return decodeURIComponent(s ?? "");
}

function isValidSpotifyUserId(id: string): boolean {
  if (id.length < 1 || id.length > 64) return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

profilePhotosRouter.get("/by-spotify/:spotifyUserId", async (req: Request, res: Response) => {
  try {
    const spotifyUserId = parseSpotifyUserIdParam(req);
    if (!isValidSpotifyUserId(spotifyUserId)) {
      res.status(400).json({ error: "Invalid Spotify user id" });
      return;
    }
    const doc = await ProfilePhotoDao.findBySpotifyUserId(spotifyUserId);
    if (!doc) {
      res.status(404).json({ error: "No profile photo" });
      return;
    }
    res.json({
      spotifyUserId: doc.spotifyUserId,
      imageBase64: doc.imageBase64,
      mimeType: doc.mimeType,
      updatedAt: doc.updatedAt.toISOString()
    });
  } catch {
    res.status(500).json({ error: "Failed to load profile photo" });
  }
});

export const MAX_BATCH_PROFILE_PHOTO_HANDLES = 100;

/**
 * Body: `{ handles: string[] }` — public @handles. Returns `photos` keyed by handle
 * (only entries that have a stored image).
 */
profilePhotosRouter.post("/batch", async (req: Request, res: Response) => {
  try {
    const raw = req.body?.handles;
    if (!Array.isArray(raw)) {
      res.status(400).json({ error: "Expected handles array" });
      return;
    }
    const handles = raw
      .map((h) => (typeof h === "string" ? h.trim().toLowerCase() : ""))
      .filter((h) => h.length > 0)
      .slice(0, MAX_BATCH_PROFILE_PHOTO_HANDLES);
    if (handles.length === 0) {
      res.json({ photos: {} as Record<string, { imageBase64: string; mimeType: string }> });
      return;
    }
    const unique = [...new Set(handles)];
    const profiles = await ProfileDao.findByProfileHandles(unique);
    const spotifyIds = profiles.map((p) => p.spotifyUserId).filter((id): id is string => Boolean(id));
    const bySpotify = await ProfilePhotoDao.findBySpotifyUserIds(spotifyIds);
    const photos: Record<string, { imageBase64: string; mimeType: string }> = {};
    for (const p of profiles) {
      if (!p.spotifyUserId) continue;
      const doc = bySpotify.get(p.spotifyUserId);
      if (doc) {
        photos[p.profileHandle] = {
          imageBase64: doc.imageBase64,
          mimeType: doc.mimeType
        };
      }
    }
    res.json({ photos });
  } catch {
    res.status(500).json({ error: "Failed to load profile photos" });
  }
});

profilePhotosRouter.put("/by-spotify/:spotifyUserId", async (req: Request, res: Response) => {
  try {
    const spotifyUserId = parseSpotifyUserIdParam(req);
    if (!isValidSpotifyUserId(spotifyUserId)) {
      res.status(400).json({ error: "Invalid Spotify user id" });
      return;
    }
    const body = req.body as { imageBase64?: unknown; mimeType?: unknown };
    const imageBase64 =
      typeof body.imageBase64 === "string" ? body.imageBase64.replace(/\s/g, "") : "";
    let mimeType =
      typeof body.mimeType === "string" && body.mimeType.trim()
        ? body.mimeType.trim().toLowerCase()
        : "image/jpeg";
    if (!imageBase64) {
      res.status(400).json({ error: "Missing imageBase64" });
      return;
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      res.status(400).json({ error: "Unsupported image type" });
      return;
    }
    const doc = await ProfilePhotoDao.upsert(spotifyUserId, imageBase64, mimeType);
    res.json({
      spotifyUserId: doc.spotifyUserId,
      imageBase64: doc.imageBase64,
      mimeType: doc.mimeType,
      updatedAt: doc.updatedAt.toISOString()
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("too large")) {
      res.status(413).json({ error: "Image too large" });
      return;
    }
    res.status(500).json({ error: "Failed to save profile photo" });
  }
});
