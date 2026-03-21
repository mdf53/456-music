"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = __importDefault(require("os"));
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
function lanIPv4Addresses() {
    const nets = os_1.default.networkInterfaces();
    const out = [];
    for (const addrs of Object.values(nets)) {
        for (const net of addrs ?? []) {
            const fam = net.family;
            if ((fam === "IPv4" || fam === 4) && !net.internal) {
                out.push(net.address);
            }
        }
    }
    return out;
}
async function start() {
    await (0, connection_1.connectDb)();
    const host = process.env.HOST ?? "0.0.0.0";
    app.listen(port, host, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port} (bound to ${host})`);
        const lan = lanIPv4Addresses();
        if (lan.length > 0) {
            // eslint-disable-next-line no-console
            console.log("  From a phone on the same Wi‑Fi, set EXPO_PUBLIC_API_BASE_URL to one of:");
            for (const ip of lan) {
                // eslint-disable-next-line no-console
                console.log(`    http://${ip}:${port}`);
            }
            // eslint-disable-next-line no-console
            console.log("  Pick the address in the SAME subnet as Expo (see Metro: exp://192.168.x.x:8081).");
        }
    });
}
start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
});
