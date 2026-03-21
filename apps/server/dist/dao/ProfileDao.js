"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileDao = void 0;
exports.normalizeProfileHandle = normalizeProfileHandle;
exports.isValidProfileHandle = isValidProfileHandle;
const mongodb_1 = require("mongodb");
const connection_1 = require("../db/connection");
const PostDao_1 = require("./PostDao");
const SongCollectionDao_1 = require("./SongCollectionDao");
const COLLECTION = "profiles";
const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;
function normalizeProfileHandle(raw) {
    return raw.trim().toLowerCase();
}
function isValidProfileHandle(normalized) {
    if (/\s/.test(normalized))
        return false;
    return HANDLE_REGEX.test(normalized);
}
const emptySongFavorites = () => [{ title: "" }, { title: "" }, { title: "" }];
const emptyArtistFavorites = () => [{ name: "" }, { name: "" }, { name: "" }];
exports.ProfileDao = {
    async findAll(limit = 100) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.find({}).limit(limit).toArray();
    },
    async findByHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ profileHandle });
    },
    async findBySpotifyUserId(spotifyUserId) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ spotifyUserId });
    },
    /**
     * Profile linked to this Spotify account (by spotifyUserId, or legacy row where profileHandle === Spotify id).
     */
    async findBySpotifyAccount(spotifyUserId) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const byId = await col.findOne({ spotifyUserId });
        if (byId)
            return byId;
        return col.findOne({ profileHandle: spotifyUserId });
    },
    async findById(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return null;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ _id: new mongodb_1.ObjectId(id) });
    },
    async create(profile) {
        const doc = {
            ...profile,
            friends: [],
            friendRequestsReceived: [],
            friendRequestsSent: [],
            favoriteArtists: emptyArtistFavorites(),
            favoriteSongs: emptySongFavorites(),
            createdAt: new Date(),
        };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    },
    async update(profileHandle, updates) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: updates });
        return result.modifiedCount === 1;
    },
    async addFriend(profileHandle, friendHandle) {
        if (profileHandle === friendHandle)
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $addToSet: { friends: friendHandle } });
        return result.modifiedCount === 1;
    },
    async removeFriend(profileHandle, friendHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $pull: { friends: friendHandle } });
        return result.modifiedCount === 1;
    },
    /** Substring match on profileHandle (case-insensitive), for friend search. */
    async searchByHandleQuery(query, limit = 20) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const q = normalizeProfileHandle(query);
        if (q.length < 1)
            return [];
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return col
            .find({ profileHandle: { $regex: escaped, $options: "i" } })
            .limit(Math.min(limit, 50))
            .toArray();
    },
    async sendFriendRequest(fromHandle, toHandle) {
        const fromH = normalizeProfileHandle(fromHandle);
        const toH = normalizeProfileHandle(toHandle);
        if (fromH === toH)
            return { ok: false, code: "SELF" };
        const from = await this.findByHandle(fromH);
        const to = await this.findByHandle(toH);
        if (!from || !to)
            return { ok: false, code: "NOT_FOUND" };
        const fFriends = from.friends ?? [];
        const tFriends = to.friends ?? [];
        if (fFriends.includes(toH) || tFriends.includes(fromH)) {
            return { ok: false, code: "ALREADY_FRIENDS" };
        }
        const fRecv = from.friendRequestsReceived ?? [];
        const fSent = from.friendRequestsSent ?? [];
        const tRecv = to.friendRequestsReceived ?? [];
        if (tRecv.includes(fromH))
            return { ok: false, code: "ALREADY_PENDING" };
        if (fSent.includes(toH))
            return { ok: false, code: "ALREADY_PENDING" };
        if (fRecv.includes(toH))
            return { ok: false, code: "ALREADY_INCOMING" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateOne({ profileHandle: toH }, { $addToSet: { friendRequestsReceived: fromH } });
        await col.updateOne({ profileHandle: fromH }, { $addToSet: { friendRequestsSent: toH } });
        return { ok: true };
    },
    async acceptFriendRequest(accepterHandle, requesterHandle) {
        const acH = normalizeProfileHandle(accepterHandle);
        const reqH = normalizeProfileHandle(requesterHandle);
        const accepter = await this.findByHandle(acH);
        const requester = await this.findByHandle(reqH);
        if (!accepter || !requester)
            return { ok: false, code: "NOT_FOUND" };
        const recv = accepter.friendRequestsReceived ?? [];
        if (!recv.includes(reqH))
            return { ok: false, code: "NO_REQUEST" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        /** Clear pending in both directions (handles mutual requests) and add friendship. */
        await col.updateOne({ profileHandle: acH }, {
            $pull: {
                friendRequestsReceived: reqH,
                friendRequestsSent: reqH
            },
            $addToSet: { friends: reqH }
        });
        await col.updateOne({ profileHandle: reqH }, {
            $pull: {
                friendRequestsReceived: acH,
                friendRequestsSent: acH
            },
            $addToSet: { friends: acH }
        });
        return { ok: true };
    },
    async declineFriendRequest(declinerHandle, requesterHandle) {
        const dH = normalizeProfileHandle(declinerHandle);
        const reqH = normalizeProfileHandle(requesterHandle);
        const decliner = await this.findByHandle(dH);
        if (!decliner)
            return { ok: false, code: "NOT_FOUND" };
        const recv = decliner.friendRequestsReceived ?? [];
        if (!recv.includes(reqH))
            return { ok: false, code: "NO_REQUEST" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateOne({ profileHandle: dH }, { $pull: { friendRequestsReceived: reqH } });
        await col.updateOne({ profileHandle: reqH }, { $pull: { friendRequestsSent: dH } });
        return { ok: true };
    },
    async setFavoriteArtists(profileHandle, artists) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: { favoriteArtists: artists } });
        // matchedCount: doc exists; modifiedCount can be 0 if BSON matches existing (still success)
        return result.matchedCount === 1;
    },
    async setFavoriteSongs(profileHandle, songs) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: { favoriteSongs: songs } });
        return result.matchedCount === 1;
    },
    async deleteByHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.deleteOne({ profileHandle });
        return result.deletedCount === 1;
    },
    /**
     * Change primary profileHandle and fix references (friends, posts, song collections).
     */
    async renameProfileHandle(oldHandle, newHandleRaw) {
        const normalized = normalizeProfileHandle(newHandleRaw);
        if (!isValidProfileHandle(normalized)) {
            return { ok: false, code: "INVALID" };
        }
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const doc = await col.findOne({ profileHandle: oldHandle });
        if (!doc)
            return { ok: false, code: "NOT_FOUND" };
        if (normalizeProfileHandle(doc.profileHandle) === normalized) {
            return { ok: true, profile: doc };
        }
        const taken = await col.findOne({ profileHandle: normalized });
        if (taken)
            return { ok: false, code: "TAKEN" };
        await col.updateOne({ profileHandle: oldHandle }, { $set: { profileHandle: normalized } });
        await col.updateMany({ friends: oldHandle }, { $set: { "friends.$[f]": normalized } }, { arrayFilters: [{ f: oldHandle }] });
        await col.updateMany({ friendRequestsReceived: oldHandle }, { $set: { "friendRequestsReceived.$[f]": normalized } }, { arrayFilters: [{ f: oldHandle }] });
        await col.updateMany({ friendRequestsSent: oldHandle }, { $set: { "friendRequestsSent.$[f]": normalized } }, { arrayFilters: [{ f: oldHandle }] });
        await PostDao_1.PostDao.rewriteAuthorHandle(oldHandle, normalized);
        await SongCollectionDao_1.SongCollectionDao.renameProfileHandleKey(oldHandle, normalized);
        const updated = await col.findOne({ profileHandle: normalized });
        return { ok: true, profile: updated };
    },
    /**
     * Onboarding / Let's Go: ensure Spotify user is linked, set or rename public profileHandle, create profile if missing.
     */
    async applyOnboardingHandle(spotifyUserId, displayName, requestedHandleRaw) {
        const normalized = normalizeProfileHandle(requestedHandleRaw);
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        let doc = await this.findBySpotifyAccount(spotifyUserId);
        const sameAsExisting = doc !== null &&
            normalizeProfileHandle(doc.profileHandle) === normalized;
        if (!sameAsExisting && !isValidProfileHandle(normalized)) {
            return { ok: false, code: "INVALID" };
        }
        if (doc) {
            if (!doc.spotifyUserId) {
                await col.updateOne({ _id: doc._id }, { $set: { spotifyUserId } });
                doc = (await col.findOne({ _id: doc._id })) ?? doc;
            }
            if (normalizeProfileHandle(doc.profileHandle) === normalized) {
                if (displayName && doc.name !== displayName) {
                    await col.updateOne({ profileHandle: doc.profileHandle }, { $set: { name: displayName } });
                }
                const fresh = await col.findOne({ profileHandle: doc.profileHandle });
                return { ok: true, profile: fresh };
            }
            const renamed = await this.renameProfileHandle(doc.profileHandle, normalized);
            if (!renamed.ok) {
                if (renamed.code === "TAKEN")
                    return { ok: false, code: "TAKEN" };
                return { ok: false, code: "INVALID" };
            }
            if (displayName && renamed.profile.name !== displayName) {
                await col.updateOne({ profileHandle: normalized }, { $set: { name: displayName } });
            }
            const fresh = await col.findOne({ profileHandle: normalized });
            return { ok: true, profile: fresh };
        }
        const taken = await col.findOne({ profileHandle: normalized });
        if (taken)
            return { ok: false, code: "TAKEN" };
        const name = displayName.trim() || normalized;
        const profile = await this.create({
            name,
            profileHandle: normalized,
            spotifyUserId
        });
        return { ok: true, profile };
    },
};
