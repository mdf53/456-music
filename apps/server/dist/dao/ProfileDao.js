"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileDao = void 0;
const mongodb_1 = require("mongodb");
const connection_1 = require("../db/connection");
const COLLECTION = "profiles";
const emptyFavorites = () => ["", "", ""];
exports.ProfileDao = {
    async findAll(limit = 100) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.find({}).limit(limit).toArray();
    },
    async findByHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ profileHandle });
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
            favoriteArtists: emptyFavorites(),
            favoriteSongs: emptyFavorites(),
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
    async setFavoriteArtists(profileHandle, artists) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: { favoriteArtists: artists } });
        return result.modifiedCount === 1;
    },
    async setFavoriteSongs(profileHandle, songs) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ profileHandle }, { $set: { favoriteSongs: songs } });
        return result.modifiedCount === 1;
    },
    async deleteByHandle(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.deleteOne({ profileHandle });
        return result.deletedCount === 1;
    },
};
