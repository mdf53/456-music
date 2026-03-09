import { Router, Request, Response } from "express";
import { ProfileDao } from "../dao/ProfileDao";

export const profilesRouter = Router();

function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function ensureThreeStrings(arr: unknown, field: string): [string, string, string] | null {
  if (!Array.isArray(arr) || arr.length !== 3) return null;
  const out: [string, string, string] = [
    String(arr[0] ?? ""),
    String(arr[1] ?? ""),
    String(arr[2] ?? ""),
  ];
  return out;
}

profilesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(_req.query.limit) || 100, 200);
    const items = await ProfileDao.findAll(limit);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: "Failed to list profiles" });
  }
});

profilesRouter.get("/:handle", async (req: Request, res: Response) => {
  try {
    const profile = await ProfileDao.findByHandle(firstParam(req.params.handle));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: "Failed to get profile" });
  }
});

profilesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, profileHandle } = req.body;
    if (!name || !profileHandle) {
      return res.status(400).json({ error: "name and profileHandle required" });
    }
    const existing = await ProfileDao.findByHandle(profileHandle);
    if (existing) return res.status(409).json({ error: "Profile handle already exists" });
    const profile = await ProfileDao.create({ name, profileHandle });
    res.status(201).json(profile);
  } catch (e) {
    res.status(500).json({ error: "Failed to create profile" });
  }
});

profilesRouter.patch("/:handle", async (req: Request, res: Response) => {
  try {
    const { name, favoriteArtists, favoriteSongs } = req.body;
    const updates: { name?: string; favoriteArtists?: [string, string, string]; favoriteSongs?: [string, string, string] } = {};
    if (name !== undefined) updates.name = String(name);
    const artists = ensureThreeStrings(favoriteArtists, "favoriteArtists");
    if (artists) updates.favoriteArtists = artists;
    const songs = ensureThreeStrings(favoriteSongs, "favoriteSongs");
    if (songs) updates.favoriteSongs = songs;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const handle = firstParam(req.params.handle);
    const ok = await ProfileDao.update(handle, updates);
    if (!ok) return res.status(404).json({ error: "Profile not found" });
    const profile = await ProfileDao.findByHandle(handle);
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

profilesRouter.post("/:handle/friends", async (req: Request, res: Response) => {
  try {
    const { friendHandle } = req.body;
    if (!friendHandle) return res.status(400).json({ error: "friendHandle required" });
    const ok = await ProfileDao.addFriend(firstParam(req.params.handle), friendHandle);
    if (!ok) return res.status(404).json({ error: "Profile not found or invalid friend" });
    res.json({ added: friendHandle });
  } catch (e) {
    res.status(500).json({ error: "Failed to add friend" });
  }
});

profilesRouter.delete("/:handle/friends/:friendHandle", async (req: Request, res: Response) => {
  try {
    const ok = await ProfileDao.removeFriend(firstParam(req.params.handle), firstParam(req.params.friendHandle));
    if (!ok) return res.status(404).json({ error: "Profile not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

profilesRouter.put("/:handle/favorite-artists", async (req: Request, res: Response) => {
  try {
    const artists = ensureThreeStrings(req.body.artists, "artists");
    if (!artists) return res.status(400).json({ error: "artists must be array of 3 strings" });
    const ok = await ProfileDao.setFavoriteArtists(firstParam(req.params.handle), artists);
    if (!ok) return res.status(404).json({ error: "Profile not found" });
    res.json({ favoriteArtists: artists });
  } catch (e) {
    res.status(500).json({ error: "Failed to set favorite artists" });
  }
});

profilesRouter.put("/:handle/favorite-songs", async (req: Request, res: Response) => {
  try {
    const songs = ensureThreeStrings(req.body.songs, "songs");
    if (!songs) return res.status(400).json({ error: "songs must be array of 3 strings" });
    const ok = await ProfileDao.setFavoriteSongs(firstParam(req.params.handle), songs);
    if (!ok) return res.status(404).json({ error: "Profile not found" });
    res.json({ favoriteSongs: songs });
  } catch (e) {
    res.status(500).json({ error: "Failed to set favorite songs" });
  }
});

profilesRouter.delete("/:handle", async (req: Request, res: Response) => {
  try {
    const ok = await ProfileDao.deleteByHandle(firstParam(req.params.handle));
    if (!ok) return res.status(404).json({ error: "Profile not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete profile" });
  }
});
