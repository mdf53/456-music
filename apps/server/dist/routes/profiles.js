"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilesRouter = void 0;
const express_1 = require("express");
const ProfileDao_1 = require("../dao/ProfileDao");
exports.profilesRouter = (0, express_1.Router)();
function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function ensureThreeStrings(arr, field) {
    if (!Array.isArray(arr) || arr.length !== 3)
        return null;
    const out = [
        String(arr[0] ?? ""),
        String(arr[1] ?? ""),
        String(arr[2] ?? ""),
    ];
    return out;
}
exports.profilesRouter.get("/", async (_req, res) => {
    try {
        const limit = Math.min(Number(_req.query.limit) || 100, 200);
        const items = await ProfileDao_1.ProfileDao.findAll(limit);
        res.json({ items });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to list profiles" });
    }
});
exports.profilesRouter.get("/:handle", async (req, res) => {
    try {
        const profile = await ProfileDao_1.ProfileDao.findByHandle(firstParam(req.params.handle));
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        res.json(profile);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to get profile" });
    }
});
exports.profilesRouter.post("/", async (req, res) => {
    try {
        const { name, profileHandle } = req.body;
        if (!name || !profileHandle) {
            return res.status(400).json({ error: "name and profileHandle required" });
        }
        const existing = await ProfileDao_1.ProfileDao.findByHandle(profileHandle);
        if (existing)
            return res.status(409).json({ error: "Profile handle already exists" });
        const profile = await ProfileDao_1.ProfileDao.create({ name, profileHandle });
        res.status(201).json(profile);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to create profile" });
    }
});
exports.profilesRouter.patch("/:handle", async (req, res) => {
    try {
        const { name, favoriteArtists, favoriteSongs } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = String(name);
        const artists = ensureThreeStrings(favoriteArtists, "favoriteArtists");
        if (artists)
            updates.favoriteArtists = artists;
        const songs = ensureThreeStrings(favoriteSongs, "favoriteSongs");
        if (songs)
            updates.favoriteSongs = songs;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }
        const handle = firstParam(req.params.handle);
        const ok = await ProfileDao_1.ProfileDao.update(handle, updates);
        if (!ok)
            return res.status(404).json({ error: "Profile not found" });
        const profile = await ProfileDao_1.ProfileDao.findByHandle(handle);
        res.json(profile);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});
exports.profilesRouter.post("/:handle/friends", async (req, res) => {
    try {
        const { friendHandle } = req.body;
        if (!friendHandle)
            return res.status(400).json({ error: "friendHandle required" });
        const ok = await ProfileDao_1.ProfileDao.addFriend(firstParam(req.params.handle), friendHandle);
        if (!ok)
            return res.status(404).json({ error: "Profile not found or invalid friend" });
        res.json({ added: friendHandle });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to add friend" });
    }
});
exports.profilesRouter.delete("/:handle/friends/:friendHandle", async (req, res) => {
    try {
        const ok = await ProfileDao_1.ProfileDao.removeFriend(firstParam(req.params.handle), firstParam(req.params.friendHandle));
        if (!ok)
            return res.status(404).json({ error: "Profile not found" });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: "Failed to remove friend" });
    }
});
exports.profilesRouter.put("/:handle/favorite-artists", async (req, res) => {
    try {
        const artists = ensureThreeStrings(req.body.artists, "artists");
        if (!artists)
            return res.status(400).json({ error: "artists must be array of 3 strings" });
        const ok = await ProfileDao_1.ProfileDao.setFavoriteArtists(firstParam(req.params.handle), artists);
        if (!ok)
            return res.status(404).json({ error: "Profile not found" });
        res.json({ favoriteArtists: artists });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to set favorite artists" });
    }
});
exports.profilesRouter.put("/:handle/favorite-songs", async (req, res) => {
    try {
        const songs = ensureThreeStrings(req.body.songs, "songs");
        if (!songs)
            return res.status(400).json({ error: "songs must be array of 3 strings" });
        const ok = await ProfileDao_1.ProfileDao.setFavoriteSongs(firstParam(req.params.handle), songs);
        if (!ok)
            return res.status(404).json({ error: "Profile not found" });
        res.json({ favoriteSongs: songs });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to set favorite songs" });
    }
});
exports.profilesRouter.delete("/:handle", async (req, res) => {
    try {
        const ok = await ProfileDao_1.ProfileDao.deleteByHandle(firstParam(req.params.handle));
        if (!ok)
            return res.status(404).json({ error: "Profile not found" });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: "Failed to delete profile" });
    }
});
