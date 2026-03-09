"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./db/connection");
const posts_1 = require("./routes/posts");
const songCollections_1 = require("./routes/songCollections");
const profiles_1 = require("./routes/profiles");
const PostDao_1 = require("./dao/PostDao");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.get("/v1/ping", (_req, res) => {
    res.json({ message: "pong" });
});
app.get("/v1/feed", async (_req, res) => {
    try {
        const items = await PostDao_1.PostDao.findAll("createdAt", 50);
        res.json({ items });
    }
    catch {
        res.status(500).json({ error: "Failed to load feed" });
    }
});
app.use("/v1/posts", posts_1.postsRouter);
app.use("/v1/collections", songCollections_1.songCollectionsRouter);
app.use("/v1/profiles", profiles_1.profilesRouter);
async function start() {
    await (0, connection_1.connectDb)();
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${port}`);
    });
}
start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
});
