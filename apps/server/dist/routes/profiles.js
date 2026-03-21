"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilesRouter = void 0;
const express_1 = require("express");
const ProfileDao_1 = require("../dao/ProfileDao");
const profileFavorites_1 = require("../utils/profileFavorites");
exports.profilesRouter = (0, express_1.Router)();
function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function ensureThreeFavoriteArtists(arr) {
    if (!Array.isArray(arr) || arr.length !== 3)
        return null;
    return [
        (0, profileFavorites_1.parseFavoriteArtistEntryBody)(arr[0]),
        (0, profileFavorites_1.parseFavoriteArtistEntryBody)(arr[1]),
        (0, profileFavorites_1.parseFavoriteArtistEntryBody)(arr[2])
    ];
}
function ensureThreeFavoriteSongs(arr) {
    if (!Array.isArray(arr) || arr.length !== 3)
        return null;
    return [
        (0, profileFavorites_1.parseFavoriteSongEntryBody)(arr[0]),
        (0, profileFavorites_1.parseFavoriteSongEntryBody)(arr[1]),
        (0, profileFavorites_1.parseFavoriteSongEntryBody)(arr[2])
    ];
}
function sendProfile(res, profile) {
    res.json((0, profileFavorites_1.normalizeProfileFavorites)(profile));
}
exports.profilesRouter.get("/", async (_req, res) => {
    try {
        const limit = Math.min(Number(_req.query.limit) || 100, 200);
        const items = (await ProfileDao_1.ProfileDao.findAll(limit)).map((p) => (0, profileFavorites_1.normalizeProfileFavorites)(p));
        res.json({ items });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to list profiles" });
    }
});
/** Search profiles by @handle substring (`/lookup` avoids clashing with handle "search"). */
exports.profilesRouter.get("/lookup", async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : "";
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const items = (await ProfileDao_1.ProfileDao.searchByHandleQuery(q, limit)).map((p) => (0, profileFavorites_1.normalizeProfileFavorites)(p));
        res.json({ items });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to search profiles" });
    }
});
/**
 * Look up profile by Spotify OAuth user id (must be before GET /:handle).
 * Uses spotifyUserId field or legacy rows where profileHandle === Spotify id.
 */
exports.profilesRouter.get("/by-spotify/:spotifyUserId", async (req, res) => {
    try {
        const spotifyUserId = firstParam(req.params.spotifyUserId);
        if (!spotifyUserId || !spotifyUserId.trim()) {
            return res.status(400).json({ error: "spotifyUserId required" });
        }
        const profile = await ProfileDao_1.ProfileDao.findBySpotifyAccount(spotifyUserId.trim());
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        sendProfile(res, profile);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to get profile" });
    }
});
exports.profilesRouter.get("/:handle", async (req, res) => {
    try {
        const profile = await ProfileDao_1.ProfileDao.findByHandle(firstParam(req.params.handle));
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        sendProfile(res, profile);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to get profile" });
    }
});
exports.profilesRouter.post("/", async (req, res) => {
    try {
        const { name, profileHandle, spotifyUserId } = req.body;
        if (!name || !profileHandle) {
            return res.status(400).json({ error: "name and profileHandle required" });
        }
        const existing = await ProfileDao_1.ProfileDao.findByHandle(profileHandle);
        if (existing)
            return res.status(409).json({ error: "Profile handle already exists" });
        if (spotifyUserId && typeof spotifyUserId === "string") {
            const bySpotify = await ProfileDao_1.ProfileDao.findBySpotifyUserId(spotifyUserId);
            if (bySpotify) {
                return res.status(409).json({ error: "This Spotify account already has a profile" });
            }
        }
        const profile = await ProfileDao_1.ProfileDao.create({
            name,
            profileHandle,
            ...(typeof spotifyUserId === "string" && spotifyUserId
                ? { spotifyUserId }
                : {})
        });
        res.status(201).json((0, profileFavorites_1.normalizeProfileFavorites)(profile));
    }
    catch (e) {
        res.status(500).json({ error: "Failed to create profile" });
    }
});
/**
 * Finish onboarding: link Spotify user id + chosen @handle (JSON body — avoids odd chars in URLs).
 * Creates the profile if login-time create failed (e.g. phone couldn't reach server).
 */
exports.profilesRouter.post("/by-spotify/handle", async (req, res) => {
    try {
        const { spotifyUserId, profileHandle, name } = req.body;
        if (!spotifyUserId || typeof spotifyUserId !== "string") {
            return res.status(400).json({ error: "spotifyUserId (string) required" });
        }
        if (!profileHandle || typeof profileHandle !== "string") {
            return res.status(400).json({ error: "profileHandle (string) required" });
        }
        const displayName = typeof name === "string" && name.trim().length > 0 ? name.trim() : profileHandle;
        const result = await ProfileDao_1.ProfileDao.applyOnboardingHandle(spotifyUserId, displayName, profileHandle);
        if (result.ok) {
            return sendProfile(res, result.profile);
        }
        if (result.code === "TAKEN") {
            return res.status(409).json({ error: "That handle is already taken" });
        }
        return res.status(400).json({
            error: "Handle must be 3–30 characters: lowercase letters, numbers, and underscores only"
        });
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error("[profiles] by-spotify/handle", e);
        res.status(500).json({ error: "Failed to save profile handle" });
    }
});
/** Set a new @handle (updates references across profiles, posts, collections). */
exports.profilesRouter.patch("/:handle/handle", async (req, res) => {
    try {
        const oldHandle = firstParam(req.params.handle);
        const { newHandle } = req.body;
        if (newHandle === undefined || typeof newHandle !== "string") {
            return res.status(400).json({ error: "newHandle (string) required" });
        }
        const result = await ProfileDao_1.ProfileDao.renameProfileHandle(oldHandle, newHandle);
        if (result.ok) {
            return sendProfile(res, result.profile);
        }
        if (result.code === "NOT_FOUND")
            return res.status(404).json({ error: "Profile not found" });
        if (result.code === "TAKEN")
            return res.status(409).json({ error: "That handle is already taken" });
        return res.status(400).json({
            error: "Handle must be 3–30 characters: lowercase letters, numbers, and underscores only"
        });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to rename handle" });
    }
});
exports.profilesRouter.patch("/:handle", async (req, res) => {
    try {
        const { name, favoriteArtists, favoriteSongs } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = String(name);
        const artists = ensureThreeFavoriteArtists(favoriteArtists);
        if (artists)
            updates.favoriteArtists = artists;
        const songs = ensureThreeFavoriteSongs(favoriteSongs);
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
        if (!profile)
            return res.status(404).json({ error: "Profile not found" });
        sendProfile(res, profile);
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
/** Send a friend request from :handle to toHandle in body. */
exports.profilesRouter.post("/:handle/friend-requests", async (req, res) => {
    try {
        const fromHandle = firstParam(req.params.handle);
        const { toHandle } = req.body;
        if (!toHandle || typeof toHandle !== "string") {
            return res.status(400).json({ error: "toHandle (string) required" });
        }
        const result = await ProfileDao_1.ProfileDao.sendFriendRequest(fromHandle, toHandle);
        if (result.ok)
            return res.status(201).json({ sent: true });
        const errMsg = {
            SELF: "Cannot send a friend request to yourself",
            NOT_FOUND: "Profile not found",
            ALREADY_FRIENDS: "You are already friends",
            ALREADY_PENDING: "Friend request already sent",
            ALREADY_INCOMING: "This user already sent you a request — accept it in Friend Requests"
        };
        const status = result.code === "NOT_FOUND"
            ? 404
            : result.code === "SELF"
                ? 400
                : 409;
        res.status(status).json({ error: errMsg[result.code] ?? "Cannot send request" });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to send friend request" });
    }
});
/** Accept incoming request from :fromHandle (you are :handle). */
exports.profilesRouter.post("/:handle/friend-requests/:fromHandle/accept", async (req, res) => {
    try {
        const accepter = firstParam(req.params.handle);
        const requester = firstParam(req.params.fromHandle);
        const result = await ProfileDao_1.ProfileDao.acceptFriendRequest(accepter, requester);
        if (result.ok) {
            const profile = await ProfileDao_1.ProfileDao.findByHandle(accepter);
            if (!profile)
                return res.status(404).json({ error: "Profile not found" });
            return sendProfile(res, profile);
        }
        if (result.code === "NOT_FOUND")
            return res.status(404).json({ error: "Profile not found" });
        return res.status(400).json({ error: "No pending request from this user" });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to accept friend request" });
    }
});
/** Decline incoming request from :fromHandle. */
exports.profilesRouter.delete("/:handle/friend-requests/:fromHandle", async (req, res) => {
    try {
        const decliner = firstParam(req.params.handle);
        const requester = firstParam(req.params.fromHandle);
        const result = await ProfileDao_1.ProfileDao.declineFriendRequest(decliner, requester);
        if (result.ok)
            return res.status(204).send();
        if (result.code === "NOT_FOUND")
            return res.status(404).json({ error: "Profile not found" });
        return res.status(400).json({ error: "No pending request from this user" });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to decline friend request" });
    }
});
exports.profilesRouter.put("/:handle/favorite-artists", async (req, res) => {
    try {
        const artists = ensureThreeFavoriteArtists(req.body.artists);
        if (!artists) {
            return res.status(400).json({
                error: "artists must be an array of 3 items (string name or { name, imageUrl? })"
            });
        }
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
        const songs = ensureThreeFavoriteSongs(req.body.songs);
        if (!songs) {
            return res.status(400).json({
                error: "songs must be an array of 3 items (string title or { title, artist?, albumCoverUrl? })"
            });
        }
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
