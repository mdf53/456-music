"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songCollectionsRouter = void 0;
const express_1 = require("express");
const SongCollectionDao_1 = require("../dao/SongCollectionDao");
exports.songCollectionsRouter = (0, express_1.Router)();
function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.songCollectionsRouter.get("/:profileHandle", async (req, res) => {
    try {
        const collection = await SongCollectionDao_1.SongCollectionDao.findOrCreate(firstParam(req.params.profileHandle));
        res.json(collection);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to get song collection" });
    }
});
exports.songCollectionsRouter.post("/:profileHandle/songs", async (req, res) => {
    try {
        const { title, artist, album, albumCover, postId } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ error: "title and artist required" });
        }
        const profileHandle = firstParam(req.params.profileHandle);
        const ok = await SongCollectionDao_1.SongCollectionDao.addSavedSong(profileHandle, {
            title,
            artist,
            album,
            albumCover,
            postId,
        });
        if (!ok)
            return res.status(500).json({ error: "Failed to add song" });
        const collection = await SongCollectionDao_1.SongCollectionDao.findByProfileHandle(profileHandle);
        res.status(201).json(collection);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to add saved song" });
    }
});
exports.songCollectionsRouter.delete("/:profileHandle/songs/:index", async (req, res) => {
    try {
        const index = parseInt(firstParam(req.params.index), 10);
        if (Number.isNaN(index) || index < 0) {
            return res.status(400).json({ error: "Invalid index" });
        }
        const ok = await SongCollectionDao_1.SongCollectionDao.removeSavedSong(firstParam(req.params.profileHandle), index);
        if (!ok)
            return res.status(404).json({ error: "Collection or index not found" });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: "Failed to remove saved song" });
    }
});
exports.songCollectionsRouter.put("/:profileHandle/songs", async (req, res) => {
    try {
        const savedSongs = Array.isArray(req.body.savedSongs) ? req.body.savedSongs : [];
        const profileHandle = firstParam(req.params.profileHandle);
        const ok = await SongCollectionDao_1.SongCollectionDao.setSavedSongs(profileHandle, savedSongs);
        if (!ok)
            return res.status(500).json({ error: "Failed to update songs" });
        const collection = await SongCollectionDao_1.SongCollectionDao.findByProfileHandle(profileHandle);
        res.json(collection);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to set saved songs" });
    }
});
