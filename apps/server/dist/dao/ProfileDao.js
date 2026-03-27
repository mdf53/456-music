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
/** Internal "account id" for relationships (stable across handle renames). */
function profileAccountKey(p) {
    // spotifyUserId is the preferred stable key; fall back to handle for legacy docs.
    return p.spotifyUserId ?? p.profileHandle;
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
    async findByProfileHandles(handles) {
        if (handles.length === 0)
            return [];
        const normalized = [
            ...new Set(handles.map((h) => normalizeProfileHandle(h)).filter((h) => h.length > 0))
        ];
        if (normalized.length === 0)
            return [];
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.find({ profileHandle: { $in: normalized } }).toArray();
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
        const friend = await this.findByHandle(normalizeProfileHandle(friendHandle));
        if (!friend)
            return false;
        const friendKey = profileAccountKey(friend);
        const result = await col.updateOne({ profileHandle }, { $addToSet: { friends: friendKey } });
        return result.modifiedCount === 1;
    },
    async removeFriend(profileHandle, friendHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const fromH = normalizeProfileHandle(profileHandle);
        const toH = normalizeProfileHandle(friendHandle);
        const from = await this.findByHandle(fromH);
        const to = await this.findByHandle(toH);
        const fromKey = from ? profileAccountKey(from) : fromH;
        const toKey = to ? profileAccountKey(to) : toH;
        // Best-effort cleanup: pull both directions for both possible representations
        // (legacy handle vs new spotify-key).
        const valuesFrom = Array.from(new Set([toKey, toH]));
        const valuesTo = Array.from(new Set([fromKey, fromH]));
        let modified = 0;
        for (const v of valuesFrom) {
            const r = await col.updateOne({ profileHandle: fromH }, {
                $pull: {
                    friends: v,
                    friendRequestsReceived: v,
                    friendRequestsSent: v
                }
            });
            modified += r.modifiedCount;
        }
        for (const v of valuesTo) {
            const r = await col.updateOne({ profileHandle: toH }, {
                $pull: {
                    friends: v,
                    friendRequestsReceived: v,
                    friendRequestsSent: v
                }
            });
            modified += r.modifiedCount;
        }
        return modified > 0;
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
        const fromKey = profileAccountKey(from);
        const toKey = profileAccountKey(to);
        const fFriends = from.friends ?? [];
        const tFriends = to.friends ?? [];
        // Support both legacy (handles) and new (spotify keys) docs.
        const alreadyFriends = fFriends.includes(toKey) ||
            fFriends.includes(toH) ||
            tFriends.includes(fromKey) ||
            tFriends.includes(fromH);
        if (alreadyFriends) {
            return { ok: false, code: "ALREADY_FRIENDS" };
        }
        const fRecv = from.friendRequestsReceived ?? [];
        const fSent = from.friendRequestsSent ?? [];
        const tRecv = to.friendRequestsReceived ?? [];
        const alreadyIncoming = fRecv.includes(toKey) || fRecv.includes(toH);
        const alreadyPendingOutgoing = fSent.includes(toKey) || fSent.includes(toH) || tRecv.includes(fromKey) || tRecv.includes(fromH);
        // Incoming means: I have already received a request from the other person.
        if (alreadyPendingOutgoing)
            return { ok: false, code: "ALREADY_PENDING" };
        if (alreadyIncoming)
            return { ok: false, code: "ALREADY_INCOMING" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateOne({ profileHandle: toH }, { $addToSet: { friendRequestsReceived: fromKey } });
        await col.updateOne({ profileHandle: fromH }, { $addToSet: { friendRequestsSent: toKey } });
        return { ok: true };
    },
    async acceptFriendRequest(accepterHandle, requesterHandle) {
        const acH = normalizeProfileHandle(accepterHandle);
        const reqH = normalizeProfileHandle(requesterHandle);
        const accepter = await this.findByHandle(acH);
        const requester = await this.findByHandle(reqH);
        if (!accepter || !requester)
            return { ok: false, code: "NOT_FOUND" };
        const acKey = profileAccountKey(accepter);
        const reqKey = profileAccountKey(requester);
        const recv = accepter.friendRequestsReceived ?? [];
        const hasRequest = recv.includes(reqKey) || recv.includes(reqH);
        if (!hasRequest)
            return { ok: false, code: "NO_REQUEST" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        /** Clear pending in both directions (handles mutual requests) and add friendship. */
        await col.updateOne({ profileHandle: acH }, {
            $pull: {
                friendRequestsReceived: { $in: [reqKey, reqH] },
                friendRequestsSent: { $in: [reqKey, reqH] }
            },
            $addToSet: { friends: reqKey }
        });
        await col.updateOne({ profileHandle: reqH }, {
            $pull: {
                friendRequestsReceived: { $in: [acKey, acH] },
                friendRequestsSent: { $in: [acKey, acH] }
            },
            $addToSet: { friends: acKey }
        });
        return { ok: true };
    },
    async declineFriendRequest(declinerHandle, requesterHandle) {
        const dH = normalizeProfileHandle(declinerHandle);
        const reqH = normalizeProfileHandle(requesterHandle);
        const decliner = await this.findByHandle(dH);
        if (!decliner)
            return { ok: false, code: "NOT_FOUND" };
        const req = await this.findByHandle(reqH);
        const reqKey = req ? profileAccountKey(req) : reqH;
        const recv = decliner.friendRequestsReceived ?? [];
        if (!recv.includes(reqKey) && !recv.includes(reqH))
            return { ok: false, code: "NO_REQUEST" };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateOne({ profileHandle: dH }, { $pull: { friendRequestsReceived: { $in: [reqKey, reqH] } } });
        await col.updateOne({ profileHandle: reqH }, { $pull: { friendRequestsSent: { $in: [dH, profileAccountKey(decliner)] } } });
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
