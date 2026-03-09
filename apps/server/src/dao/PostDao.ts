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

  async create(post: Omit<Post, "_id" | "likes" | "comments" | "createdAt">): Promise<Post> {
    const doc: Post = {
      ...post,
      likes: 0,
      comments: [],
      createdAt: new Date(),
    };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.insertOne(doc as Post);
    return { ...doc, _id: result.insertedId };
  },

  async addLike(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );
    return result.modifiedCount === 1;
  },

  async removeLike(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: new ObjectId(id), likes: { $gt: 0 } },
      { $inc: { likes: -1 } }
    );
    return result.modifiedCount === 1;
  },

  async addComment(id: string, comment: Omit<Comment, "createdAt">): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const fullComment: Comment = { ...comment, createdAt: new Date() };
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: fullComment } }
    );
    return result.modifiedCount === 1;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const col = getDb().collection<Post>(COLLECTION);
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};
