import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

app.get("/v1/feed", (_req, res) => {
  res.json({
    items: [
      {
        id: "demo-1",
        user: "keepintune",
        song: "Song of the Day",
        artist: "Demo Artist",
        caption: "Check out my song!"
      }
    ]
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
