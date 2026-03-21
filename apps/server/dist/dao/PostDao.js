"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostDao = void 0;
const mongodb_1 = require("mongodb");
const connection_1 = require("../db/connection");
const COLLECTION = "posts";
exports.PostDao = {
    async findAll(sortBy = "createdAt", limit = 50) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const cursor = col.find({}).sort(sortBy, -1).limit(limit);
        return cursor.toArray();
    },
    async findById(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return null;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.findOne({ _id: new mongodb_1.ObjectId(id) });
    },
    async findByAuthor(profileHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        return col.find({ authorHandle: profileHandle }).sort({ createdAt: -1 }).toArray();
    },
    async create(post) {
        const doc = {
            ...post,
            likes: 0,
            comments: [],
            createdAt: new Date(),
        };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    },
    async addLike(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $inc: { likes: 1 } });
        return result.modifiedCount === 1;
    },
    async removeLike(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ _id: new mongodb_1.ObjectId(id), likes: { $gt: 0 } }, { $inc: { likes: -1 } });
        return result.modifiedCount === 1;
    },
    async addComment(id, comment) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const fullComment = { ...comment, createdAt: new Date() };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { comments: fullComment } });
        return result.modifiedCount === 1;
    },
    async delete(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return result.deletedCount === 1;
    },
    /** Rewrite authorHandle on posts and in nested comments (e.g. after profile rename). */
    async rewriteAuthorHandle(oldHandle, newHandle) {
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        await col.updateMany({ authorHandle: oldHandle }, { $set: { authorHandle: newHandle } });
        const posts = await col.find({ "comments.authorHandle": oldHandle }).toArray();
        for (const p of posts) {
            const comments = p.comments.map((c) => c.authorHandle === oldHandle ? { ...c, authorHandle: newHandle } : c);
            await col.updateOne({ _id: p._id }, { $set: { comments } });
        }
    },
};
