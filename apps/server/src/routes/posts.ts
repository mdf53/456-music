import { Router, Request, Response } from "express";
import { PostDao } from "../dao/PostDao";
import { ProfileDao } from "../dao/ProfileDao";

export const postsRouter = Router();

function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function getViewerSpotifyUserId(req: Request): string | null {
  const fromBody =
    typeof (req.body as any)?.viewerSpotifyUserId === "string"
      ? (req.body as any).viewerSpotifyUserId
      : null;
  const fromQuery =
    typeof req.query.viewerSpotifyUserId === "string"
      ? req.query.viewerSpotifyUserId
      : null;
  return fromBody ?? fromQuery;
}

/** @handles for the viewer + resolved friends (for feed scoping). */
async function getFeedAuthorHandles(viewerSpotifyUserId: string): Promise<string[]> {
  const profile = await ProfileDao.findBySpotifyAccount(viewerSpotifyUserId);
  if (!profile) return [];
  const handles = new Set<string>();
  handles.add(profile.profileHandle);
  for (const friendId of profile.friends ?? []) {
    const resolved = await ProfileDao.findBySpotifyAccount(friendId);
    if (resolved?.profileHandle) handles.add(resolved.profileHandle);
  }
  return [...handles];
}

async function isPostOwner(post: { authorSpotifyUserId?: string; authorHandle?: string }, viewerSpotifyUserId: string): Promise<boolean> {
  if (post.authorSpotifyUserId) {
    return post.authorSpotifyUserId === viewerSpotifyUserId;
  }
  if (post.authorHandle) {
    const viewerProfile = await ProfileDao.findBySpotifyUserId(viewerSpotifyUserId);
    return !!viewerProfile && viewerProfile.profileHandle === post.authorHandle;
  }
  return false;
}

async function isCommentOwner(
  comment: { authorSpotifyUserId?: string; authorHandle?: string },
  viewerSpotifyUserId: string
): Promise<boolean> {
  if (comment.authorSpotifyUserId) {
    return comment.authorSpotifyUserId === viewerSpotifyUserId;
  }
  if (comment.authorHandle) {
    const viewerProfile = await ProfileDao.findBySpotifyUserId(viewerSpotifyUserId);
    return !!viewerProfile && viewerProfile.profileHandle === comment.authorHandle;
  }
  return false;
}

postsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const sortBy = (req.query.sortBy as "createdAt" | "likes") ?? "createdAt";
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const viewerSpotifyUserId =
      typeof req.query.viewerSpotifyUserId === "string" && req.query.viewerSpotifyUserId
        ? req.query.viewerSpotifyUserId
        : null;
    const afterRaw = req.query.after;
    const beforeRaw = req.query.before;
    const after =
      typeof afterRaw === "string" && afterRaw ? new Date(afterRaw) : null;
    const before =
      typeof beforeRaw === "string" && beforeRaw ? new Date(beforeRaw) : null;

    let items;
    if (
      viewerSpotifyUserId &&
      after &&
      before &&
      !Number.isNaN(after.getTime()) &&
      !Number.isNaN(before.getTime())
    ) {
      const authorHandles = await getFeedAuthorHandles(viewerSpotifyUserId);
      items =
        authorHandles.length > 0
          ? await PostDao.findForFeed(authorHandles, after, before, limit)
          : [];
    } else {
      items = await PostDao.findAll(sortBy, limit);
    }

    // Resolve handle display based on spotify ids (only for fields we display).
    const spotifyIds = new Set<string>();
    if (viewerSpotifyUserId) spotifyIds.add(viewerSpotifyUserId);
    for (const p of items) {
      if (p.authorSpotifyUserId) spotifyIds.add(p.authorSpotifyUserId);
      for (const c of p.comments ?? []) {
        if (c.authorSpotifyUserId) spotifyIds.add(c.authorSpotifyUserId);
      }
    }

    const spotifyToHandle = new Map<string, string>();
    await Promise.all(
      [...spotifyIds].map(async (id) => {
        const profile = await ProfileDao.findBySpotifyUserId(id);
        if (profile) spotifyToHandle.set(id, profile.profileHandle);
      })
    );

    const dtoItems = items.map((p) => {
      const authorHandle =
        (p.authorSpotifyUserId && spotifyToHandle.get(p.authorSpotifyUserId)) ||
        p.authorHandle ||
        "";

      const liked = viewerSpotifyUserId
        ? (p.likedBy ?? []).includes(viewerSpotifyUserId)
        : false;

      return {
        // DTO fields expected by mobile ServerFacade / presenter:
        _id: p._id,
        authorHandle,
        title: p.title,
        artist: p.artist,
        album: p.album,
        albumCover: p.albumCover,
        previewUrl: p.previewUrl,
        caption: p.caption,
        likes: p.likes,
        spotifyTrackId: p.spotifyTrackId,
        createdAt: p.createdAt,
        liked,
        comments: (p.comments ?? []).map((c) => ({
          authorHandle:
            (c.authorSpotifyUserId && spotifyToHandle.get(c.authorSpotifyUserId)) ||
            c.authorHandle ||
            "",
          text: c.text,
          createdAt: c.createdAt,
          liked: viewerSpotifyUserId ? (c.likedBy ?? []).includes(viewerSpotifyUserId) : false,
          likes: (c.likedBy ?? []).length
        }))
      };
    });

    res.json({ items: dtoItems });
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
    const viewerSpotifyUserId =
      typeof req.query.viewerSpotifyUserId === "string" && req.query.viewerSpotifyUserId
        ? req.query.viewerSpotifyUserId
        : null;

    const spotifyIds = new Set<string>();
    if (post.authorSpotifyUserId) spotifyIds.add(post.authorSpotifyUserId);
    for (const c of post.comments ?? []) {
      if (c.authorSpotifyUserId) spotifyIds.add(c.authorSpotifyUserId);
    }
    if (viewerSpotifyUserId) spotifyIds.add(viewerSpotifyUserId);

    const spotifyToHandle = new Map<string, string>();
    await Promise.all(
      [...spotifyIds].map(async (id) => {
        const profile = await ProfileDao.findBySpotifyUserId(id);
        if (profile) spotifyToHandle.set(id, profile.profileHandle);
      })
    );

    const authorHandle =
      (post.authorSpotifyUserId && spotifyToHandle.get(post.authorSpotifyUserId)) ||
      post.authorHandle ||
      "";

    const liked = viewerSpotifyUserId
      ? (post.likedBy ?? []).includes(viewerSpotifyUserId)
      : false;

    res.json({
      _id: post._id,
      authorHandle,
      title: post.title,
      artist: post.artist,
      album: post.album,
      albumCover: post.albumCover,
      previewUrl: post.previewUrl,
      caption: post.caption,
      likes: post.likes,
      spotifyTrackId: post.spotifyTrackId,
      createdAt: post.createdAt,
      liked,
      comments: (post.comments ?? []).map((c) => ({
        authorHandle:
          (c.authorSpotifyUserId && spotifyToHandle.get(c.authorSpotifyUserId)) ||
          c.authorHandle ||
          "",
        text: c.text,
        createdAt: c.createdAt,
        liked: viewerSpotifyUserId ? (c.likedBy ?? []).includes(viewerSpotifyUserId) : false,
        likes: (c.likedBy ?? []).length
      }))
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to get post" });
  }
});

postsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      authorHandle,
      authorSpotifyUserId,
      title,
      artist,
      album,
      albumCover,
      caption,
      previewUrl,
      spotifyTrackId
    } = req.body;
    if (!authorSpotifyUserId || !title || !artist || !album) {
      return res.status(400).json({ error: "authorSpotifyUserId, title, artist, album required" });
    }
    const post = await PostDao.create({
      authorHandle,
      authorSpotifyUserId,
      title,
      artist,
      album,
      albumCover,
      caption,
      previewUrl,
      spotifyTrackId,
    });
    res.status(201).json({
      ...post,
      liked: false,
      // strip internals for safety
      likedBy: undefined,
      authorSpotifyUserId: undefined,
      comments: post.comments
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

postsRouter.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const { viewerSpotifyUserId } = req.body ?? {};
    if (!viewerSpotifyUserId || typeof viewerSpotifyUserId !== "string") {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const alreadyLiked = (post.likedBy ?? []).includes(viewerSpotifyUserId);
    if (!alreadyLiked) {
      await PostDao.addLike(postId, viewerSpotifyUserId);
    }
    const updated = await PostDao.findById(postId);
    res.json({ liked: true, likes: updated?.likes ?? post.likes });
  } catch (e) {
    res.status(500).json({ error: "Failed to add like" });
  }
});

postsRouter.delete("/:id/like", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const viewerSpotifyUserIdFromBody =
      typeof (req.body as any)?.viewerSpotifyUserId === "string"
        ? (req.body as any).viewerSpotifyUserId
        : null;
    const viewerSpotifyUserIdFromQuery =
      typeof req.query.viewerSpotifyUserId === "string"
        ? req.query.viewerSpotifyUserId
        : null;
    const viewerSpotifyUserId = viewerSpotifyUserIdFromBody ?? viewerSpotifyUserIdFromQuery;
    if (!viewerSpotifyUserId || typeof viewerSpotifyUserId !== "string") {
      return res.status(400).json({
        error: "viewerSpotifyUserId (string) required (body or query)"
      });
    }
    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const alreadyLiked = (post.likedBy ?? []).includes(viewerSpotifyUserId);
    if (alreadyLiked) {
      await PostDao.removeLike(postId, viewerSpotifyUserId);
    }
    const updated = await PostDao.findById(postId);
    res.json({ liked: false, likes: updated?.likes ?? post.likes });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove like" });
  }
});

postsRouter.post("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { authorHandle, authorSpotifyUserId, text } = req.body;
    if (!authorSpotifyUserId || !text) {
      return res.status(400).json({ error: "authorSpotifyUserId and text required" });
    }
    const ok = await PostDao.addComment(firstParam(req.params.id), {
      authorHandle,
      authorSpotifyUserId,
      text
    });
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.status(201).json({
      comment: { authorHandle, text }
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

postsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const viewerSpotifyUserId = getViewerSpotifyUserId(req);
    const caption = typeof req.body?.caption === "string" ? req.body.caption.trim() : null;

    if (!viewerSpotifyUserId) {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    if (caption == null) {
      return res.status(400).json({ error: "caption (string) required" });
    }

    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!(await isPostOwner(post, viewerSpotifyUserId))) {
      return res.status(403).json({ error: "Only the post author can edit this post" });
    }

    const ok = await PostDao.updateCaption(postId, caption);
    if (!ok) return res.status(404).json({ error: "Post not found" });

    res.json({ caption });
  } catch {
    res.status(500).json({ error: "Failed to edit post" });
  }
});

postsRouter.post("/:id/comments/:commentIndex/like", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const commentIndexRaw = firstParam(req.params.commentIndex);
    const commentIndex = Number(commentIndexRaw);
    const { viewerSpotifyUserId } = req.body ?? {};
    if (!viewerSpotifyUserId || typeof viewerSpotifyUserId !== "string") {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    const result = await PostDao.addCommentLike(postId, commentIndex, viewerSpotifyUserId);
    if (!result) return res.status(404).json({ error: "Comment not found" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to like comment" });
  }
});

postsRouter.delete("/:id/comments/:commentIndex/like", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const commentIndexRaw = firstParam(req.params.commentIndex);
    const commentIndex = Number(commentIndexRaw);
    const { viewerSpotifyUserId } = req.body ?? {};
    if (!viewerSpotifyUserId || typeof viewerSpotifyUserId !== "string") {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    const result = await PostDao.removeCommentLike(postId, commentIndex, viewerSpotifyUserId);
    if (!result) return res.status(404).json({ error: "Comment not found" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to unlike comment" });
  }
});

postsRouter.patch("/:id/comments/:commentIndex", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const commentIndex = Number(firstParam(req.params.commentIndex));
    const viewerSpotifyUserId = getViewerSpotifyUserId(req);
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : null;

    if (!viewerSpotifyUserId) {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    if (!Number.isInteger(commentIndex) || commentIndex < 0) {
      return res.status(400).json({ error: "commentIndex must be a non-negative integer" });
    }
    if (text == null || text.length === 0) {
      return res.status(400).json({ error: "text (non-empty string) required" });
    }

    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = post.comments?.[commentIndex];
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (!(await isCommentOwner(comment, viewerSpotifyUserId))) {
      return res.status(403).json({ error: "Only the comment author can edit this comment" });
    }

    const ok = await PostDao.updateCommentText(postId, commentIndex, text);
    if (!ok) return res.status(404).json({ error: "Comment not found" });

    res.json({ text });
  } catch {
    res.status(500).json({ error: "Failed to edit comment" });
  }
});

postsRouter.delete("/:id/comments/:commentIndex", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const commentIndex = Number(firstParam(req.params.commentIndex));
    const viewerSpotifyUserId = getViewerSpotifyUserId(req);

    if (!viewerSpotifyUserId) {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }
    if (!Number.isInteger(commentIndex) || commentIndex < 0) {
      return res.status(400).json({ error: "commentIndex must be a non-negative integer" });
    }

    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = post.comments?.[commentIndex];
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (!(await isCommentOwner(comment, viewerSpotifyUserId))) {
      return res.status(403).json({ error: "Only the comment author can delete this comment" });
    }

    const ok = await PostDao.deleteComment(postId, commentIndex);
    if (!ok) return res.status(404).json({ error: "Comment not found" });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

postsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const postId = firstParam(req.params.id);
    const viewerSpotifyUserId = getViewerSpotifyUserId(req);
    if (!viewerSpotifyUserId) {
      return res.status(400).json({ error: "viewerSpotifyUserId (string) required" });
    }

    const post = await PostDao.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!(await isPostOwner(post, viewerSpotifyUserId))) {
      return res.status(403).json({ error: "Only the post author can delete this post" });
    }

    const ok = await PostDao.delete(postId);
    if (!ok) return res.status(404).json({ error: "Post not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});
