"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongCollectionDao = void 0;
const connection_1 = require("../db/connection");
const COLLECTION = "songCollections";
exports.SongCollectionDao = {
    async findByProfileHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ profileHandle });
    },
    async create(profileHandle) {
        const doc = {
            profileHandle,
            savedSongs: [],
            updatedAt: new Date(),
        };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    },
    async findOrCreate(profileHandle) {
        const existing = await this.findByProfileHandle(profileHandle);
        if (existing)
            return existing;
        return this.create(profileHandle);
    },
    async addSavedSong(profileHandle, song) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, {
            $push: { savedSongs: song },
            $set: { updatedAt: new Date() },
        }, { upsert: true });
        return result.acknowledged;
    },
    async removeSavedSong(profileHandle, index) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const doc = await col.findOne({ profileHandle });
        if (!doc || index < 0 || index >= doc.savedSongs.length)
            return false;
        const updated = [...doc.savedSongs];
        updated.splice(index, 1);
        const result = await col.updateOne({ profileHandle }, { $set: { savedSongs: updated, updatedAt: new Date() } });
        return result.modifiedCount === 1;
    },
    async setSavedSongs(profileHandle, savedSongs) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: { savedSongs, updatedAt: new Date() } }, { upsert: true });
        return result.acknowledged;
    },
    async deleteByProfileHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.deleteOne({ profileHandle });
        return result.deletedCount === 1;
    },
    async renameProfileHandleKey(oldHandle, newHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateOne({ profileHandle: oldHandle }, { $set: { profileHandle: newHandle, updatedAt: new Date() } });
    },
};
