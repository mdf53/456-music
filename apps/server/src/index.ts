import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import os from "os";
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

function lanIPv4Addresses(): string[] {
  const nets = os.networkInterfaces();
  const out: string[] = [];
  for (const addrs of Object.values(nets)) {
    for (const net of addrs ?? []) {
      const fam = net.family as string | number;
      if ((fam === "IPv4" || fam === 4) && !net.internal) {
        out.push(net.address);
      }
    }
  }
  return out;
}

async function start() {
  await connectDb();
  const host = process.env.HOST ?? "0.0.0.0";
  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port} (bound to ${host})`);
    const lan = lanIPv4Addresses();
    if (lan.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        "  From a phone on the same Wi‑Fi, set EXPO_PUBLIC_API_BASE_URL to one of:"
      );
      for (const ip of lan) {
        // eslint-disable-next-line no-console
        console.log(`    http://${ip}:${port}`);
      }
      // eslint-disable-next-line no-console
      console.log(
        "  Pick the address in the SAME subnet as Expo (see Metro: exp://192.168.x.x:8081)."
      );
    }
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
