"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilePhotoDao = void 0;
const connection_1 = require("../db/connection");
const COLLECTION = "profilePhotos";
/** ~1.5MB raw base64 is plenty for a square profile image. */
const MAX_BASE64_CHARS = 2200000;
exports.ProfilePhotoDao = {
    async ensureIndexes() {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.createIndex({ spotifyUserId: 1 }, { unique: true });
    },
    async findBySpotifyUserId(spotifyUserId) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ spotifyUserId });
    },
    /** One doc per id — for batch lookups. */
    async findBySpotifyUserIds(spotifyUserIds) {
        if (spotifyUserIds.length === 0)
            return new Map();
        const unique = [...new Set(spotifyUserIds.filter(Boolean))];
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const docs = await col.find({ spotifyUserId: { $in: unique } }).toArray();
        const m = new Map();
        for (const d of docs) {
            m.set(d.spotifyUserId, d);
        }
        return m;
    },
    async upsert(spotifyUserId, imageBase64, mimeType) {
        if (imageBase64.length > MAX_BASE64_CHARS) {
            throw new Error("Image too large");
        }
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const now = new Date();
        await col.updateOne({ spotifyUserId }, {
            $set: {
                spotifyUserId,
                imageBase64,
                mimeType,
                updatedAt: now
            }
        }, { upsert: true });
        const doc = await col.findOne({ spotifyUserId });
        if (!doc)
            throw new Error("Failed to save profile photo");
        return doc;
    }
};
