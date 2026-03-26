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
            likedBy: [],
            comments: [],
            createdAt: new Date(),
        };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.insertOne(doc);
        return { ...doc, _id: result.insertedId };
    },
    async addLike(id, viewerSpotifyUserId) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ _id: new mongodb_1.ObjectId(id), likedBy: { $ne: viewerSpotifyUserId } }, {
            $addToSet: { likedBy: viewerSpotifyUserId },
            $inc: { likes: 1 }
        });
        return result.modifiedCount === 1;
    },
    async removeLike(id, viewerSpotifyUserId) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({
            _id: new mongodb_1.ObjectId(id),
            likes: { $gt: 0 },
            likedBy: viewerSpotifyUserId
        }, {
            $pull: { likedBy: viewerSpotifyUserId },
            $inc: { likes: -1 }
        });
        return result.modifiedCount === 1;
    },
    async addComment(id, comment) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const fullComment = {
            ...comment,
            createdAt: new Date(),
            likedBy: comment.likedBy ?? []
        };
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const result = await col.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $push: { comments: fullComment } });
        return result.modifiedCount === 1;
    },
    async addCommentLike(postId, commentIndex, viewerSpotifyUserId) {
        if (!mongodb_1.ObjectId.isValid(postId))
            return null;
        if (!Number.isInteger(commentIndex) || commentIndex < 0)
            return null;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const updateResult = await col.updateOne({ _id: new mongodb_1.ObjectId(postId), [`comments.${commentIndex}`]: { $exists: true } }, {
            $addToSet: { [`comments.${commentIndex}.likedBy`]: viewerSpotifyUserId }
        });
        if (updateResult.matchedCount !== 1)
            return null;
        const post = await col.findOne({ _id: new mongodb_1.ObjectId(postId) });
        const c = post?.comments?.[commentIndex];
        const likes = c?.likedBy?.length ?? 0;
        const liked = (c?.likedBy ?? []).includes(viewerSpotifyUserId);
        return { liked, likes };
    },
    async removeCommentLike(postId, commentIndex, viewerSpotifyUserId) {
        if (!mongodb_1.ObjectId.isValid(postId))
            return null;
        if (!Number.isInteger(commentIndex) || commentIndex < 0)
            return null;
        const col = (0, connection_1.getDb)().collection(COLLECTION);
        const updateResult = await col.updateOne({ _id: new mongodb_1.ObjectId(postId), [`comments.${commentIndex}`]: { $exists: true } }, {
            $pull: { [`comments.${commentIndex}.likedBy`]: viewerSpotifyUserId }
        });
        if (updateResult.matchedCount !== 1)
            return null;
        const post = await col.findOne({ _id: new mongodb_1.ObjectId(postId) });
        const c = post?.comments?.[commentIndex];
        const likes = c?.likedBy?.length ?? 0;
        const liked = (c?.likedBy ?? []).includes(viewerSpotifyUserId);
        return { liked, likes };
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
