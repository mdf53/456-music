import { ObjectId } from "mongodb";
import { getDb } from "../db/connection";
import type { Post, Comment } from "../types";

const COLLECTION = "posts";

export const PostDao = {
  async findAll(sortBy: "createdAt" | "likes" = "createdAt", limit = 50): Promise<Post[]> {
    const col = getDb().collection<Post>(COLLECTION);
    const cursor = col.find({}).sort(sortBy, -1).limit(limit);
    return cursor.toArray();
  },

  async findById(id: string): Promise<Post | null> {
    if (!ObjectId.isValid(id)) return null;
    const col = getDb().collection<Post>(COLLECTION);
    return col.findOne({ _id: new ObjectId(id) });
  },

  async findByAuthor(profileHandle: string): Promise<Post[]> {
    const col = getDb().collection<Post>(COLLECTION);
    return col.find({ authorHandle: profileHandle }).sort({ createdAt: -1 }).toArray();
  },

  async create(post: Omit<Post, "_id" | "likes" | "comments" | "createdAt" | "likedBy">): Promise<Post> {
    const doc: Post = {
      ...post,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date(),
    };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.insertOne(doc as Post);
    return { ...doc, _id: result.insertedId };
  },

  async addLike(id: string, viewerSpotifyUserId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: new ObjectId(id), likedBy: { $ne: viewerSpotifyUserId } },
      {
        $addToSet: { likedBy: viewerSpotifyUserId },
        $inc: { likes: 1 }
      }
    );
    return result.modifiedCount === 1;
  },

  async removeLike(id: string, viewerSpotifyUserId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      {
        _id: new ObjectId(id),
        likes: { $gt: 0 },
        likedBy: viewerSpotifyUserId
      },
      {
        $pull: { likedBy: viewerSpotifyUserId },
        $inc: { likes: -1 }
      }
    );
    return result.modifiedCount === 1;
  },

  async addComment(
    id: string,
    comment: Omit<Comment, "createdAt">
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const fullComment: Comment = {
      ...comment,
      createdAt: new Date(),
      likedBy: comment.likedBy ?? []
    };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: fullComment } }
    );
    return result.modifiedCount === 1;
  },

  async addCommentLike(
    postId: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number } | null> {
    if (!ObjectId.isValid(postId)) return null;
    if (!Number.isInteger(commentIndex) || commentIndex < 0) return null;
    const col = getDb().collection<Post>(COLLECTION);

    const updateResult = await col.updateOne(
      { _id: new ObjectId(postId), [`comments.${commentIndex}`]: { $exists: true } },
      {
        $addToSet: { [`comments.${commentIndex}.likedBy`]: viewerSpotifyUserId }
      }
    );
    if (updateResult.matchedCount !== 1) return null;

    const post = await col.findOne({ _id: new ObjectId(postId) });
    const c = post?.comments?.[commentIndex];
    const likes = c?.likedBy?.length ?? 0;
    const liked = (c?.likedBy ?? []).includes(viewerSpotifyUserId);
    return { liked, likes };
  },

  async removeCommentLike(
    postId: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number } | null> {
    if (!ObjectId.isValid(postId)) return null;
    if (!Number.isInteger(commentIndex) || commentIndex < 0) return null;
    const col = getDb().collection<Post>(COLLECTION);

    const updateResult = await col.updateOne(
      { _id: new ObjectId(postId), [`comments.${commentIndex}`]: { $exists: true } },
      {
        $pull: { [`comments.${commentIndex}.likedBy`]: viewerSpotifyUserId }
      }
    );
    if (updateResult.matchedCount !== 1) return null;

    const post = await col.findOne({ _id: new ObjectId(postId) });
    const c = post?.comments?.[commentIndex];
    const likes = c?.likedBy?.length ?? 0;
    const liked = (c?.likedBy ?? []).includes(viewerSpotifyUserId);
    return { liked, likes };
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  /** Rewrite authorHandle on posts and in nested comments (e.g. after profile rename). */
  async rewriteAuthorHandle(oldHandle: string, newHandle: string): Promise<void> {
    const col = getDb().collection<Post>(COLLECTION);
    await col.updateMany(
      { authorHandle: oldHandle },
      { $set: { authorHandle: newHandle } }
    );
    const posts = await col.find({ "comments.authorHandle": oldHandle }).toArray();
    for (const p of posts) {
      const comments = p.comments.map((c) =>
        c.authorHandle === oldHandle ? { ...c, authorHandle: newHandle } : c
      );
      await col.updateOne({ _id: p._id! }, { $set: { comments } });
    }
  },
};
