"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const PostDao_1 = require("../dao/PostDao");
exports.postsRouter = (0, express_1.Router)();
function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.postsRouter.get("/", async (req, res) => {
    try {
        const sortBy = req.query.sortBy ?? "createdAt";
        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const items = await PostDao_1.PostDao.findAll(sortBy, limit);
        res.json({ items });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to list posts" });
    }
});
exports.postsRouter.get("/author/:handle", async (req, res) => {
    try {
        const items = await PostDao_1.PostDao.findByAuthor(firstParam(req.params.handle));
        res.json({ items });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to list posts" });
    }
});
exports.postsRouter.get("/:id", async (req, res) => {
    try {
        const post = await PostDao_1.PostDao.findById(firstParam(req.params.id));
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json(post);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to get post" });
    }
});
exports.postsRouter.post("/", async (req, res) => {
    try {
        const { authorHandle, title, artist, album, albumCover, caption } = req.body;
        if (!authorHandle || !title || !artist || !album) {
            return res.status(400).json({ error: "authorHandle, title, artist, album required" });
        }
        const post = await PostDao_1.PostDao.create({
            authorHandle,
            title,
            artist,
            album,
            albumCover,
            caption,
        });
        res.status(201).json(post);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to create post" });
    }
});
exports.postsRouter.post("/:id/like", async (req, res) => {
    try {
        const ok = await PostDao_1.PostDao.addLike(firstParam(req.params.id));
        if (!ok)
            return res.status(404).json({ error: "Post not found" });
        res.json({ liked: true });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to add like" });
    }
});
exports.postsRouter.delete("/:id/like", async (req, res) => {
    try {
        const ok = await PostDao_1.PostDao.removeLike(firstParam(req.params.id));
        if (!ok)
            return res.status(404).json({ error: "Post not found" });
        res.json({ liked: false });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to remove like" });
    }
});
exports.postsRouter.post("/:id/comments", async (req, res) => {
    try {
        const { authorHandle, text } = req.body;
        if (!authorHandle || !text) {
            return res.status(400).json({ error: "authorHandle and text required" });
        }
        const ok = await PostDao_1.PostDao.addComment(firstParam(req.params.id), { authorHandle, text });
        if (!ok)
            return res.status(404).json({ error: "Post not found" });
        res.status(201).json({ comment: { authorHandle, text } });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to add comment" });
    }
});
exports.postsRouter.delete("/:id", async (req, res) => {
    try {
        const ok = await PostDao_1.PostDao.delete(firstParam(req.params.id));
        if (!ok)
            return res.status(404).json({ error: "Post not found" });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: "Failed to delete post" });
    }
});
