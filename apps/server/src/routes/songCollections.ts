import { Router, Request, Response } from "express";
import { SongCollectionDao } from "../dao/SongCollectionDao";

export const songCollectionsRouter = Router();

function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

songCollectionsRouter.get("/:profileHandle", async (req: Request, res: Response) => {
  try {
    const collection = await SongCollectionDao.findOrCreate(firstParam(req.params.profileHandle));
    res.json(collection);
  } catch (e) {
    res.status(500).json({ error: "Failed to get song collection" });
  }
});

songCollectionsRouter.post("/:profileHandle/songs", async (req: Request, res: Response) => {
  try {
    const { title, artist, album, albumCover, postId } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "title and artist required" });
    }
    const profileHandle = firstParam(req.params.profileHandle);
    const ok = await SongCollectionDao.addSavedSong(profileHandle, {
      title,
      artist,
      album,
      albumCover,
      postId,
    });
    if (!ok) return res.status(500).json({ error: "Failed to add song" });
    const collection = await SongCollectionDao.findByProfileHandle(profileHandle);
    res.status(201).json(collection);
  } catch (e) {
    res.status(500).json({ error: "Failed to add saved song" });
  }
});

songCollectionsRouter.delete("/:profileHandle/songs/:index", async (req: Request, res: Response) => {
  try {
    const index = parseInt(firstParam(req.params.index), 10);
    if (Number.isNaN(index) || index < 0) {
      return res.status(400).json({ error: "Invalid index" });
    }
    const ok = await SongCollectionDao.removeSavedSong(firstParam(req.params.profileHandle), index);
    if (!ok) return res.status(404).json({ error: "Collection or index not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to remove saved song" });
  }
});

songCollectionsRouter.put("/:profileHandle/songs", async (req: Request, res: Response) => {
  try {
    const savedSongs = Array.isArray(req.body.savedSongs) ? req.body.savedSongs : [];
    const profileHandle = firstParam(req.params.profileHandle);
    const ok = await SongCollectionDao.setSavedSongs(profileHandle, savedSongs);
    if (!ok) return res.status(500).json({ error: "Failed to update songs" });
    const collection = await SongCollectionDao.findByProfileHandle(profileHandle);
    res.json(collection);
  } catch (e) {
    res.status(500).json({ error: "Failed to set saved songs" });
  }
});
