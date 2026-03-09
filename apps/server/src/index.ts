import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./db/connection";
import { postsRouter } from "./routes/posts";
import { songCollectionsRouter } from "./routes/songCollections";
import { profilesRouter } from "./routes/profiles";
import { PostDao } from "./dao/PostDao";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/v1/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.get("/v1/feed", async (_req, res) => {
  try {
    const items = await PostDao.findAll("createdAt", 50);
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to load feed" });
  }
});

app.use("/v1/posts", postsRouter);
app.use("/v1/collections", songCollectionsRouter);
app.use("/v1/profiles", profilesRouter);

async function start() {
  await connectDb();
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
