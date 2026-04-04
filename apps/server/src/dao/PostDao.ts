import { ObjectId } from "mongodb";
import { getDb } from "../db/connection";
import type { Post, Comment } from "../types";

const COLLECTION = "posts";

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function hydrateComment(comment: Comment): Comment {
  const likedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
  return {
    ...comment,
    likedBy
  };
}

function hydratePost(post: Post): Post {
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
  const comments = Array.isArray(post.comments)
    ? post.comments.map((c) => hydrateComment(c))
    : [];
  return {
    ...post,
    likes: likedBy.length,
    likedBy,
    comments
  };
}

export const PostDao = {
  async findAll(sortBy: "createdAt" | "likes" = "createdAt", limit = 50): Promise<Post[]> {
    const col = getDb().collection<Post>(COLLECTION);
    const cursor = col.find({}).sort(sortBy, -1).limit(limit);
    const posts = await cursor.toArray();
    return posts.map((p) => hydratePost(p));
  },

  async findForFeed(
    authorHandles: string[],
    after: Date,
    before: Date,
    limit = 50
  ): Promise<Post[]> {
    if (authorHandles.length === 0) return [];
    const col = getDb().collection<Post>(COLLECTION);
    const posts = await col
      .find({
        authorHandle: { $in: authorHandles },
        createdAt: { $gte: after, $lt: before }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return posts.map((p) => hydratePost(p));
  },

  async findById(id: string): Promise<Post | null> {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    const col = getDb().collection<Post>(COLLECTION);
    const post = await col.findOne({ _id: objectId });
    return post ? hydratePost(post) : null;
  },

  async findByAuthor(profileHandle: string): Promise<Post[]> {
    const col = getDb().collection<Post>(COLLECTION);
    const posts = await col
      .find({ authorHandle: profileHandle })
      .sort({ createdAt: -1 })
      .toArray();
    return posts.map((p) => hydratePost(p));
  },

  async create(post: Omit<Post, "_id" | "likes" | "comments" | "createdAt">): Promise<Post> {
    const doc: Post = {
      ...post,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date()
    };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.insertOne(doc as Post);
    return { ...doc, _id: result.insertedId };
  },

  async addLike(id: string, viewerSpotifyUserId: string): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId) return false;
    const col = getDb().collection<Post>(COLLECTION);

    const post = await col.findOne({ _id: objectId });
    if (!post) return false;

    const likedBy = new Set(post.likedBy ?? []);
    likedBy.add(viewerSpotifyUserId);

    const result = await col.updateOne(
      { _id: objectId },
      {
        $set: {
          likedBy: [...likedBy],
          likes: likedBy.size
        }
      }
    );
    return result.modifiedCount === 1;
  },

  async removeLike(id: string, viewerSpotifyUserId: string): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId) return false;
    const col = getDb().collection<Post>(COLLECTION);

    const post = await col.findOne({ _id: objectId });
    if (!post) return false;

    const likedBy = new Set(post.likedBy ?? []);
    likedBy.delete(viewerSpotifyUserId);

    const result = await col.updateOne(
      { _id: objectId },
      {
        $set: {
          likedBy: [...likedBy],
          likes: likedBy.size
        }
      }
    );
    return result.modifiedCount === 1;
  },

  async addComment(id: string, comment: Omit<Comment, "createdAt">): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId) return false;
    const fullComment: Comment = {
      ...comment,
      createdAt: new Date(),
      likedBy: []
    };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: objectId },
      { $push: { comments: fullComment } }
    );
    return result.modifiedCount === 1;
  },

  async addCommentLike(
    id: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number } | null> {
    const objectId = toObjectId(id);
    if (!objectId || commentIndex < 0) return null;
    const col = getDb().collection<Post>(COLLECTION);
    const post = await col.findOne({ _id: objectId });
    if (!post || !Array.isArray(post.comments) || !post.comments[commentIndex]) {
      return null;
    }

    const comments = [...post.comments];
    const target = comments[commentIndex]!;
    const likedBy = new Set(target.likedBy ?? []);
    likedBy.add(viewerSpotifyUserId);
    comments[commentIndex] = {
      ...target,
      likedBy: [...likedBy]
    };

    await col.updateOne({ _id: objectId }, { $set: { comments } });
    return { liked: true, likes: likedBy.size };
  },

  async removeCommentLike(
    id: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number } | null> {
    const objectId = toObjectId(id);
    if (!objectId || commentIndex < 0) return null;
    const col = getDb().collection<Post>(COLLECTION);
    const post = await col.findOne({ _id: objectId });
    if (!post || !Array.isArray(post.comments) || !post.comments[commentIndex]) {
      return null;
    }

    const comments = [...post.comments];
    const target = comments[commentIndex]!;
    const likedBy = new Set(target.likedBy ?? []);
    likedBy.delete(viewerSpotifyUserId);
    comments[commentIndex] = {
      ...target,
      likedBy: [...likedBy]
    };

    await col.updateOne({ _id: objectId }, { $set: { comments } });
    return { liked: false, likes: likedBy.size };
  },

  async updateCaption(id: string, caption: string): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne({ _id: objectId }, { $set: { caption } });
    return result.modifiedCount === 1;
  },

  async updateCommentText(
    id: string,
    commentIndex: number,
    text: string
  ): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId || commentIndex < 0) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const post = await col.findOne({ _id: objectId });
    if (!post || !Array.isArray(post.comments) || !post.comments[commentIndex]) {
      return false;
    }
    const comments = [...post.comments];
    comments[commentIndex] = {
      ...comments[commentIndex],
      text
    };
    const result = await col.updateOne({ _id: objectId }, { $set: { comments } });
    return result.modifiedCount === 1;
  },

  async deleteComment(id: string, commentIndex: number): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId || commentIndex < 0) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const post = await col.findOne({ _id: objectId });
    if (!post || !Array.isArray(post.comments) || !post.comments[commentIndex]) {
      return false;
    }
    const comments = post.comments.filter((_, idx) => idx !== commentIndex);
    const result = await col.updateOne({ _id: objectId }, { $set: { comments } });
    return result.modifiedCount === 1;
  },

  async delete(id: string): Promise<boolean> {
    const objectId = toObjectId(id);
    if (!objectId) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.deleteOne({ _id: objectId });
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
  }
};
