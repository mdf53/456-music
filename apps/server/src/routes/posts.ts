import { Router, Request, Response } from "express";
import { PostDao } from "../dao/PostDao";

export const postsRouter = Router();

function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

postsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const sortBy = (req.query.sortBy as "createdAt" | "likes") ?? "createdAt";
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const items = await PostDao.findAll(sortBy, limit);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: "Failed to list posts" });
  }
});

postsRouter.get("/author/:handle", async (req: Request, res: Response) => {
  try {
    const items = await PostDao.findByAuthor(firstParam(req.params.handle));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: "Failed to list posts" });
  }
});

postsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const post = await PostDao.findById(firstParam(req.params.id));
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: "Failed to get post" });
  }
});

postsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      authorHandle,
      title,
      artist,
      album,
      albumCover,
      caption,
      previewUrl,
      spotifyTrackId
    } = req.body;
    if (!authorHandle || !title || !artist || !album) {
      return res.status(400).json({ error: "authorHandle, title, artist, album required" });
    }
    const post = await PostDao.create({
      authorHandle,
      title,
      artist,
      album,
      albumCover,
      caption,
      previewUrl,
      spotifyTrackId,
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

postsRouter.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const ok = await PostDao.addLike(firstParam(req.params.id));
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.json({ liked: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to add like" });
  }
});

postsRouter.delete("/:id/like", async (req: Request, res: Response) => {
  try {
    const ok = await PostDao.removeLike(firstParam(req.params.id));
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.json({ liked: false });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove like" });
  }
});

postsRouter.post("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { authorHandle, text } = req.body;
    if (!authorHandle || !text) {
      return res.status(400).json({ error: "authorHandle and text required" });
    }
    const ok = await PostDao.addComment(firstParam(req.params.id), { authorHandle, text });
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.status(201).json({ comment: { authorHandle, text } });
  } catch (e) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

postsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const ok = await PostDao.delete(firstParam(req.params.id));
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});
